export interface ConfigOptions {}

type Accessor<In, Out> = Out | string | ((obj: In) => Out);
type NodeAccessor<T> = Accessor<Node, T>;

export interface Node {
  __dataNode?: DataNode;
  name?: string;
  children?: Node[];
}

export interface DataNode {
  data: Node;
  id: number;
  value: number;
  depth: number;
  height: number;
  parent: DataNode | null;
  children?: DataNode[];
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
}

type CompareFn<ItemType> = (a: ItemType, b: ItemType) => number;

type TooltipFn = (node: Node, dataNode: DataNode) => string;

declare class CirclePackChart {
  constructor(element: HTMLElement, configOptions?: ConfigOptions);

  width(): number;
  width(width: number): CirclePackChart;
  height(): number;
  height(height: number): CirclePackChart;

  data(): Node;
  data(rootNode: Node): CirclePackChart;
  children(): NodeAccessor<Node[]>;
  children(childrenAccessor: NodeAccessor<Node[]>): CirclePackChart;
  label(): NodeAccessor<string>;
  label(textAccessor: NodeAccessor<string>): CirclePackChart;
  size(): NodeAccessor<string>;
  size(sizeAccessor: NodeAccessor<string>): CirclePackChart;
  padding(): number;
  padding(padding: number): CirclePackChart;
  color(): NodeAccessor<string>;
  color(colorAccessor: NodeAccessor<string>): CirclePackChart;
  borderWidth(): NodeAccessor<string>;
  borderWidth(borderWidthAccessor: NodeAccessor<string>): CirclePackChart;
  nodeClassName(): NodeAccessor<string>;
  nodeClassName(nodeClassName: NodeAccessor<string>): CirclePackChart;

  minCircleRadius(): number;
  minCircleRadius(r: number): CirclePackChart;
  excludeRoot(): boolean;
  excludeRoot(exclude: boolean): CirclePackChart;

  sort(): CompareFn<Node> | null;
  sort(cmpFn: CompareFn<Node> | null): CirclePackChart;

  showLabels(): boolean;
  showLabels(show: boolean): CirclePackChart;
  showTooltip(): (node: Node) => boolean;
  showTooltip(showTooltipFn: (node: Node) => boolean): CirclePackChart;
  tooltipTitle(): TooltipFn;
  tooltipTitle(fn: TooltipFn): CirclePackChart;
  tooltipContent(): TooltipFn;
  tooltipContent(fn: TooltipFn): CirclePackChart;

  onClick(cb: ((node: Node, event: MouseEvent) => void) | null): CirclePackChart;
  onRightClick(cb: ((node: Node, event: MouseEvent) => void) | null): CirclePackChart;
  onHover(cb: ((node: Node | null, event: MouseEvent) => void) | null): CirclePackChart;

  zoomToNode(node: Node): CirclePackChart;
  zoomBy(k: number):CirclePackChart;
  zoomReset():CirclePackChart;

  transitionDuration(): number;
  transitionDuration(duration: number): CirclePackChart;
}

export default CirclePackChart;
