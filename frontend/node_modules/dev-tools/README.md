# Dev-tools

A javascript utility for comfort development of projects.

Install with npm

```javascript
npm install dev-tools --save
```

Use with node.js, browserify or webpack:
```javascript
var DevTools = require('dev-tools');

DevTools();
```

## Options

#### gridOptions
**Type:** *object*

**Values**
```javascript
{
  unitHeight: 0,
  colCountInRow: 12,
  colOuterPadding: 0
}
```

`unitHeight` - vertical unit height

`colCountInRow` - grid columns count in one row

`colOuterPadding` - columns outer padding

## Example
```javascript
var DevTools = require('dev-tools');

DevTools({
  gridOptions: {
    unitHeight: 50,
    colCountInRow: 12,
    colOuterPadding: 20
  }
});
```
