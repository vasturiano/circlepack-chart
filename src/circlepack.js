import { select as d3Select, event as d3Event } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { hierarchy as d3Hierarchy, pack as d3Pack } from 'd3-hierarchy';
import { transition as d3Transition } from 'd3-transition';
import { interpolate as d3Interpolate } from 'd3-interpolate';
import zoomable from 'd3-zoomable';
import Kapsule from 'kapsule';
import tinycolor from 'tinycolor2';
import accessorFn from 'accessor-fn';

const LABELS_WIDTH_OPACITY_SCALE = scaleLinear().domain([4, 8]).clamp(true); // px per char
const TRANSITION_DURATION = 800;

export default Kapsule({

  props: {
    width: {
      default: window.innerWidth,
      onChange: function() { this._parseData(); }
    },
    height: {
      default: window.innerHeight,
      onChange: function() { this._parseData(); }
    },
    data: { onChange: function() { this._parseData(); } },
    children: { default: 'children', onChange: function() { this._parseData(); }},
    sort: { onChange: function() { this._parseData(); }},
    label: { default: d => d.name },
    size: {
      default: 'value',
      onChange: function() { this.zoomReset(); this._parseData(); }
    },
    padding: { default: 4, onChange: function() { this._parseData(); }},
    color: { default: d => 'lightgrey' },
    minCircleRadius: { default: 3 },
    showLabels: { default: true },
    tooltipContent: { default: d => '', triggerUpdate: false },
    onClick: { triggerUpdate: false }
  },
  methods: {
    zoomBy: function(state, k) {
      state.zoom.zoomBy(k, TRANSITION_DURATION);
      return this;
    },
    zoomReset: function(state) {
      state.zoom.zoomReset(TRANSITION_DURATION);
      return this;
    },
    zoomToNode: function(state, d = {}) {
      const node = d.__dataNode;
      if (node) {
        const ZOOM_REL_PADDING = 0.12;

        const k = Math.max(1,
          (Math.min(state.width, state.height) / (node.r * 2)) * (1 - ZOOM_REL_PADDING)
        );

        const tr = {
          k,
          x: -Math.max(0, Math.min(
              state.width * (1 - 1 / k), // Don't pan out of chart boundaries
              node.x - state.width / k / 2 // Center circle in view
          )),
          y: -Math.max(0, Math.min(
            state.height * (1 - 1 / k),
            node.y - state.height / k / 2
          ))
        };

        state.zoom.zoomTo(tr, TRANSITION_DURATION);
      }
      return this;
    },
    _parseData: function(state) {
      if (state.data) {
        const hierData = d3Hierarchy(state.data, accessorFn(state.children))
          .sum(accessorFn(state.size));

        if (state.sort) {
          hierData.sort(state.sort);
        }

        d3Pack()
          .padding(state.padding)
          .size([state.width, state.height])(hierData);

        hierData.descendants().forEach((d, i) => {
          d.id = i; // Mark each node with a unique ID
          d.data.__dataNode = d; // Dual-link data nodes
        });

        state.layoutData = hierData.descendants();
      }
    }
  },
  stateInit: () => ({
    zoom: zoomable()
  }),
  init: function(domNode, state) {
    const el = d3Select(domNode)
      .append('div').attr('class', 'circlepack-viz');

    state.svg = el.append('svg');
    state.canvas = state.svg.append('g');

    // tooltips
    state.tooltip = d3Select('body')
      .append('div')
      .attr('class', 'chart-tooltip circlepack-tooltip');

    // tooltip cleanup on unmount
    domNode.addEventListener ('DOMNodeRemoved', function(e) {
      if (e.target === this) { state.tooltip.remove(); }
    });

    state.canvas.on('mousemove', () => {
      state.tooltip
        .style('left', d3Event.pageX + 'px')
        .style('top', d3Event.pageY + 'px')
        .style('transform', `translate(-${d3Event.offsetX / state.width * 100}%, 21px)`); // adjust horizontal position to not exceed canvas boundaries
    });

    // zoom/pan
    state.zoom(state.svg)
      .svgEl(state.canvas)
      .onChange((tr, prevTr, duration) => {
        if (state.showLabels && !duration) {
          // Scale labels immediately if not animating
          state.canvas.selectAll('text')
            .attr('transform', `scale(${1 / tr.k})`);
        }

        // Prevent using transitions when using mouse wheel to zoom
        state.skipTransitionsOnce = !duration;
        state._rerender();
      });

    state.svg
      .on('click', () => (state.onClick || this.zoomReset)(null)); // By default reset zoom when clicking on canvas
  },
  update: function(state) {
    state.svg
      .style('width', state.width + 'px')
      .style('height', state.height + 'px');

    state.zoom.translateExtent([[0, 0], [state.width, state.height]]);

    if (!state.layoutData) return;

    const zoomTr = state.zoom.current();

    const cell = state.canvas.selectAll('.node')
      .data(
      state.layoutData
        .filter(d => // Show only circles in scene that are larger than the threshold
          d.x + d.r > -zoomTr.x / zoomTr.k &&
          d.x - d.r < (state.width - zoomTr.x) / zoomTr.k &&
          d.y + d.r > -zoomTr.y / zoomTr.k &&
          d.y - d.r < (state.height - zoomTr.y) / zoomTr.k &&
          d.r >= state.minCircleRadius / zoomTr.k
        ),
        d => d.id
    );

    const nameOf = accessorFn(state.label);
    const colorOf = accessorFn(state.color);

    const animate = !state.skipTransitionsOnce;
    state.skipTransitionsOnce = false;
    const transition = d3Transition().duration(animate ? TRANSITION_DURATION: 0);

    // Exiting
    cell.exit().transition(transition).remove();

    // Entering
    const newCell = cell.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    newCell.append('circle')
      .attr('id', d => `circle-${d.id}`)
      .attr('r', 0)
      .style('stroke-width', 1)
      .on('click', d => {
        d3Event.stopPropagation();
        (state.onClick || this.zoomToNode)(d.data);
      })
      .on('mouseover', d => {
        state.tooltip.style('display', 'inline');
        state.tooltip.html(`
          <div class="tooltip-title">${getNodeStack(d).map(d => nameOf(d.data)).join(' &rarr; ')}</div>
          ${state.tooltipContent(d.data, d)}
        `);
      })
      .on('mouseout', () => { state.tooltip.style('display', 'none'); });

    newCell.append('clipPath')
      .attr('id', d => `clip-${d.id}`)
      .append('use')
        .attr('xlink:href', d => `#circle-${d.id}`);

    const label = newCell.append('g')
      .attr('clip-path', d => `url(#clip-${d.id})`)
      .append('g')
        .attr('class', 'label-container')
        .append('text')
          .attr('class', 'path-label');

    // Entering + Updating
    const allCells = cell.merge(newCell);

    allCells.transition(transition)
      .attr('transform', d => `translate(${d.x},${d.y})`);

    allCells.select('circle').transition(transition)
      .attr('r', d => d.r)
      .style('fill', d => colorOf(d.data, d.parent))
      .style('stroke-width', 1 / zoomTr.k);

    allCells.select('g.label-container')
      .style('display', state.showLabels ? null : 'none');

    if (state.showLabels) {
      // Update previous scale
      const prevK = state.prevK || 1;
      state.prevK = zoomTr.k;

      allCells.select('text.path-label')
        .classed('light', d => !tinycolor(colorOf(d.data, d.parent)).isLight())
        .text(d => nameOf(d.data))
        .transition(transition)
          .style('opacity', d => LABELS_WIDTH_OPACITY_SCALE((d.r * 2) * zoomTr.k / nameOf(d.data).length))
          .attrTween('transform', function () {
            const kTr = d3Interpolate(prevK, zoomTr.k);
            return t => `scale(${1 / kTr(t)})`;
          });
    }

    //

    function getNodeStack(d) {
      const stack = [];
      let curNode = d;
      while (curNode) {
        stack.unshift(curNode);
        curNode = curNode.parent;
      }
      return stack;
    }
  }
});
