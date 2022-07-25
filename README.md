# @mit-app-inventor/blockly-plugin-workspace-multiselect [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows to drag, select and doing actions on multiple blocks in the workspace.

## Installation

### Yarn
```
yarn add @mit-app-inventor/blockly-plugin-workspace-multiselect
```

### npm
```
npm install @mit-app-inventor/blockly-plugin-workspace-multiselect --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {Multiselect, MultiselectBlockDragger} from '@mit-app-inventor/blockly-plugin-workspace-multiselect';

options = {
  toolbox: toolboxCategories,
  plugins: {
    'blockDragger': MultiselectBlockDragger, // Required to work
  },

  // // For integration with other plugins that also
  // // need to change the blockDragger above (such as
  // // scroll-options).
  // baseBlockDragger: ScrollBlockDragger

  // Double click the blocks to collapse/expand
  // them (A feature from MIT App Inventor).
  useDoubleClick: false,
  // Bump neighbours after dragging to avoid overlapping.
  bumpNeighbours: false,

  // Use custom icon for the multi select controls.
  multiselectIcon: {
    enabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg',
    disabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg',
  },
};

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', options);

// Initialize plugin.
const multiselectPlugin = new Multiselect(workspace);
multiselectPlugin.init(options);
```

## API

- `Multiselect.init`: Initialize the plugin.
- `Multiselect.dispose`: Dispose the plugin.
- `MultiselectBlockDragger`: The customized block dragger for multiple selection.
- `blockSelection`: The set of currently selected block ids.
- `inMultipleSelectionMode`: Check whether the plugin is in multiple selection mode.

## Credit
- [ds.min.js](lib/ds.min.js): This plugin uses [a patched version of DragSelect](https://github.com/ThibaultJanBeyer/DragSelect/pull/128) to realize "drag a rectangle to select multiple blocks" feature.
- [select.svg](test/media/select.svg) & [unselect.svg](test/media/unselect.svg): Free icons downloaded at [Icons8](https://icons8.com).
- This plugin is part of the achievement by Songlin Jiang([@HollowMan6](https://github.com/HollowMan6)) participating the [Google Summer of Code 2022](https://summerofcode.withgoogle.com/programs/2022/projects/9wF06HWE) at [MIT App Inventor](https://github.com/mit-cml).

## License
Apache 2.0
