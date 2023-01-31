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
    hideIcon: false,
    enabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg',
    disabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg',
  },
};

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', options);

// Initialize plugin.
const multiselectPlugin = new Multiselect(workspace);
multiselectPlugin.init(options);

// Focus on the workspace.
// The shift drag will only work on the workspace that gets focused.
workspace.getInjectionDiv().focus();
```

## User behavior
1. When some of the selected blocks are in one block stack, for example, some top blocks and some of their children blocks are in the selection simultaneously. If applicable, the plugin only disconnects the selected most top block in that stack with its parent block. Move along with all the children's blocks of that most top block as a whole.
2. Blocks can be deselected by clicking on the workspace background.
3. Additional blocks can be able to be selected/deselected by holding SHIFT key while clicking the new/already selected block.
4. Clicking a new block without holding SHIFT key can clear the multiple selections and only select that block.
5. Holding SHIFT key to drag a rectangle area to select can reverse their selection state for the blocks touched by the rectangle.
6. Clicking on the button above the dustbin is equivalent to holding/releasing the SHIFT key for switching between the multiple selection mode and the normal mode. Icons are customizable.
7. Bumping neighbours after dragging to avoid overlapping is disabled in this plugin by default. Enable with `bumpNeighbours: true`.
8. Click on a block will bring that block to front. (In case Bumping neighbours is disabled)
9.  In multiple selection mode, workspace dragging as well as block dragging will all be disabled. You can only drag to draw a rectangle for selection.
10. The `Duplicate` menu will duplicate the selected most top block in the block stack and all the children blocks of that most top block. The selection will be changed to all newly created duplicate blocks' most top blocks.
11. The `Add Comment` / `Remove Comment` will instead read as `Add Comment (X)` / `Remove Comment (X)`, and will add / remove comment buttons to all the selected blocks.
12. The `Inline Inputs` / `External Inputs` will instead read as `Inline Inputs (X)` / `External Inputs (X)`, and will convert the input format with all the selected blocks.
13. The `Collapse Block` / `Expand Block` will instead read as `Collapse Block (X)` / `Expand Block (X)`, and will only apply to the selected most top block in the block stack.
14. The `Disable Block` / `Enable Block` will instead read as `Disable Block (X)` / `Enable Block (X)`, and will only apply to the selected most top block in the block stack. All the children blocks of that most top block will also get disabled.
15. For 11-14, `X` means the currently applicable number of selected blocks by the user, and `(X)` will only be shown when X is greater than 1.
16. The text to show in 11-14 is determined by the state of the block that the user right-clicks, and the same status will be applied to all the blocks no matter their individual state.
17. `Delete [X] Blocks` represents the count of the selected most top block in the block stack as well as all children of those selected most top block, and delete the blocks mentioned.
18. The "Help" option displays just the helping information for which block the user just right-clicked.
19. The workspace context menu has a item to `Select all Blocks` in that workspace.
20. When you use `Ctrl/Alt + A`, you can select all the blocks in the current workspace. `Ctrl/Alt + C` to copy the selected blocks, `Ctrl/Alt + X` to cut the selected blocks to the clipboard, and `Ctrl/Alt + V` to paste all the blocks currently in the clipboard and get all the newly pasted blocks selected, these will only apply to the selected most top block in the block stack.
21. When you edit the fields while selecting multiple blocks, we will automatically apply that to all the blocks with the same type.
22. (MIT App Inventor-only feature) Double click to collapse/expand currently selected blocks, enable with Blockly option `useDoubleClick: true`.

## Known issues
- [ ] Currently, we rely on DragSelect to know which block gets selected. DragSelect seems to listen to the "blocks". However, it actually works by listening to the SVG path element, which is always a rectangle with some transparent parts forming a block. For irregularly shaped blocks, if you click on the transparent area that within the SVG rectangle, it will still get selected. (a mitigation has already been introduced in v0.1.4, but a proper fix should be that Blockly implements some kind of API, so that we can know for sure where the block actually locates.)

## API

- `Multiselect.init`: Initialize the plugin.
- `Multiselect.dispose`: Dispose the plugin.
- `MultiselectBlockDragger`: The customized block dragger for multiple selection.
- `blockSelectionWeakMap`: The WeakMap storing set of currently selected block ids by workspace svg.
- `inMultipleSelectionModeWeakMap`: The WeakMap storing whether the plugin is in multiple selection mode by workspace svg.

## Credit
- [DragSelect](https://github.com/ThibaultJanBeyer/DragSelect): This plugin uses DragSelect to realize the "drag a rectangle to select multiple blocks" feature. The patching PR [#143](https://github.com/ThibaultJanBeyer/DragSelect/pull/143) and [#165](https://github.com/ThibaultJanBeyer/DragSelect/pull/165) made all this possible, and these PRs are included in [v2.6.0](https://github.com/ThibaultJanBeyer/DragSelect/releases/tag/v2.6.0)).
- [select.svg](test/media/select.svg) & [unselect.svg](test/media/unselect.svg): Free icons downloaded at [Icons8](https://icons8.com).
- This plugin is part of the achievement by Songlin Jiang([@HollowMan6](https://github.com/HollowMan6)) participating the [Google Summer of Code 2022](https://summerofcode.withgoogle.com/programs/2022/projects/9wF06HWE) at [MIT App Inventor](https://github.com/mit-cml).

## License
Apache 2.0
