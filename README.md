# blockly-plugin-workspace-multiselect [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows to darg, select and doing actions on multiple blocks in the workspace.

## Installation

### Yarn
```
yarn add blockly-plugin-workspace-multiselect
```

### npm
```
npm install blockly-plugin-workspace-multiselect --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {WorkspaceMultiSelect, MultiSelectBlockDragger} from 'blockly-plugin-workspace-multiselect';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
  plugins: {
    'blockDragger': MultiSelectBlockDragger,
  },
});

// Initialize plugin.
const multiSelectPlugin = new WorkspaceMultiSelect(workspace);
multiSelectPlugin.init();
```

## API

- `init`: Initializes to select multiple blocks in the workspace.
- `dispose`: Disposes of selecting multiple blocks in the workspace.

## Credit
- [ds.min.js](lib/ds.min.js): This plugin uses [a patched version of DragSelect](https://github.com/ThibaultJanBeyer/DragSelect/pull/128) to realize "drag a rectangle to select multiple blocks" feature.
- [select.svg](test/media/select.svg) & [unselect.svg](test/media/unselect.svg): Free icons downloaded at [Icons8](https://icons8.com).
- This plugin is part of the achievement by Songlin Jiang([@HollowMan6](https://github.com/HollowMan6)) participating the [Google Summer of Code 2022](https://summerofcode.withgoogle.com/programs/2022/projects/9wF06HWE) at [MIT App Inventor](https://github.com/mit-cml).

## License
Apache 2.0
