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
import {Multiselect, MultiselectBlockDragger} from 'blockly-plugin-workspace-multiselect';

options = {
  toolbox: toolboxCategories,
  plugins: {
    'blockDragger': MultiselectBlockDragger,
  },

  // // For integration with other plugins that also
  // // need to change the blockDragger above.
  // baseBlockDragger: xxx

  // Double click the blocks to collapse/expand
  // them (A feature from MIT App Inventor).
  useDoubleClick: false,

  // Use custom icon for the multi select controls.
  multiselectIcon: {
    // enabledIcon: 'media/select.svg',
    // disabledIcon: 'media/unselect.svg',
  },
};

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', options);

// Initialize plugin.
const multiselectPlugin = new Multiselect(workspace);
multiselectPlugin.init(options);
```

## API

- `Multiselect.init`: Initializes to select multiple blocks in the workspace.
- `Multiselect.dispose`: Disposes of selecting multiple blocks in the workspace.
- `MultiselectBlockDragger`: The customized block dragger for multiple selection.
- `blockSelection`: Get a set of currently selected block ids.
- `inMultipleSelectionMode`: Check whether the plugin is in multiple selection mode.

## Credit
- [ds.min.js](lib/ds.min.js): This plugin uses [a patched version of DragSelect](https://github.com/ThibaultJanBeyer/DragSelect/pull/128) to realize "drag a rectangle to select multiple blocks" feature.
- [select.svg](test/media/select.svg) & [unselect.svg](test/media/unselect.svg): Free icons downloaded at [Icons8](https://icons8.com).
- This plugin is part of the achievement by Songlin Jiang([@HollowMan6](https://github.com/HollowMan6)) participating the [Google Summer of Code 2022](https://summerofcode.withgoogle.com/programs/2022/projects/9wF06HWE) at [MIT App Inventor](https://github.com/mit-cml).

## License
Apache 2.0
