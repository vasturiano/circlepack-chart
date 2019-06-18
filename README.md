circlepack-chart
==================

[![NPM package][npm-img]][npm-url]
[![Build Size][build-size-img]][build-size-url]
[![Dependencies][dependencies-img]][dependencies-url]

<-- short description -->.

<p align="center">
     <a href="https://vasturiano.github.io/circlepack-chart/example/basic"><img width="80%" src="https://vasturiano.github.io/circlepack-chart/example/preview.png"></a>
</p>

<-- long description -->.

Check out the examples:
* [Basic](https://vasturiano.github.io/circlepack-chart/example/basic/) ([source](https://github.com/vasturiano/circlepack-chart/blob/master/example/basic/index.html))

## Quick start

```
import CirclePack from 'circlepack-chart';
```
or
```
const CirclePack = require('circlepack-chart');
```
or even
```
<script src="//unpkg.com/circlepack-chart"></script>
```
then
```
var myGraph = CirclePack();
myGraph(<myDOMElement>)
    .prop(...);
```

## API reference

| Method | Description | Default |
| --- | --- | :--: |
| <b>data</b>([<i>array</i>]) | Getter/setter for element data. | `[]` |

## Giving Back

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url) If this project has helped you and you'd like to contribute back, you can always [buy me a ☕](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=L398E7PKP47E8&currency_code=USD&source=url)!

[npm-img]: https://img.shields.io/npm/v/circlepack-chart.svg
[npm-url]: https://npmjs.org/package/circlepack-chart
[build-size-img]: https://img.shields.io/bundlephobia/minzip/circlepack-chart.svg
[build-size-url]: https://bundlephobia.com/result?p=circlepack-chart
[dependencies-img]: https://img.shields.io/david/vasturiano/circlepack-chart.svg
[dependencies-url]: https://david-dm.org/vasturiano/circlepack-chart
