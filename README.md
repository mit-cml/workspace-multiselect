# blockly-plugin-workspace-multiselect [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows to select multiple blocks in the workspace.

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

<!--
  - TODO: describe the API.
  -->

## License
Apache 2.0
