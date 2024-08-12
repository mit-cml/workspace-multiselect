# @mit-app-inventor/blockly-plugin-workspace-multiselect [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows you to drag, select and manipulate multiple blocks in the workspace.

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
import {Multiselect} from '@mit-app-inventor/blockly-plugin-workspace-multiselect';

options = {
  toolbox: toolboxCategories,

  // The plugin should work with other plugins
  // that require a custom block dragger, like
  // the scroll-options plugin as this plugin
  // was updated to not require a custom dragger.

  // Double click the blocks to collapse/expand
  // them (A feature from MIT App Inventor).
  useDoubleClick: false,
  // Bump neighbours after dragging to avoid overlapping.
  bumpNeighbours: false,

  // Keep the fields of multiple selected same-type blocks with the same value
  // See note below.  
  multiFieldUpdate: true,

  // Auto focus the workspace when the mouse enters.
  workspaceAutoFocus: true,

  // Use custom icon for the multi select controls.
  multiselectIcon: {
    hideIcon: false,
    weight: 3,
    enabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg',
    disabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg',
  },

  // Keys for multi-selection mode switch. Any key value is possible (see MDN docs).
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  // The best support (default) is given for Shift.  Provide an empty array []
  // will revert to the default key.
  // One thing to make sure is that the multiSelectKeys do not overlap with the
  // keys defined for the shortcut actions as it will lead to a cascade of calls,
  // which is not ideal for the browser.
  multiSelectKeys: ['Shift'],

  multiselectCopyPaste: {
    // Enable the copy/paste accross tabs feature (true by default).
    crossTab: true,
    // Show the copy/paste menu entries (true by default).
    menu: true,
  },
};

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', options);

// Initialize plugin.
const multiselectPlugin = new Multiselect(workspace);
multiselectPlugin.init(options);
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
22. You can copy and paste blocks in the same workspace and across different tabs. This plugin collides with [blockly-plugin-cross-tab-copy-paste](https://www.npmjs.com/package/@blockly/plugin-cross-tab-copy-paste) so they should not be used together.
23. (MIT App Inventor-only feature) Double click to collapse/expand currently selected blocks, enable with Blockly option `useDoubleClick: true`.
24. In [@blockly/workspace-backpack](https://www.npmjs.com/package/@blockly/workspace-backpack), `Copy to backpack (Y)` will become `(X) Copy to backpack (Y)`, where `Y` represents the number of blocks that are already in the backpack, and `X` represents the number of top most blocks that can be copied to the backpack. The `Copy to backpack (Y)` menu will only be disabled when none of the selected blocks can be copied to the backpack, and it will only be applied to the selected most top block in the block stack.

## Known issues
- [ ] Currently, we rely on DragSelect to know which block gets selected. DragSelect seems to listen to the "blocks". However, it actually works by listening to the SVG path element, which is always a rectangle with some transparent parts forming a block. For irregularly shaped blocks, if you click on the transparent area that within the SVG rectangle, it will still get selected. (a mitigation has already been introduced in v0.1.4, but a proper fix should be that Blockly implements some kind of API, so that we can know for sure where the block actually locates.)
- [ ] Currently, there is an issue related to the pointerdown event listener workaround for the setStartBlock gesture handling. The SVG root of a block that has a next block overlaps with that next block. So, when we try to remove the pointerdown event listener for the next block, it does not matter as the pointerdown event listener for the parent (higher level) block is still present. (a fix may be introduced when the Blockly team introduces proper gesture handling for setStartBlock.)

### Note on multi-field updates
When the multiFieldUpdate option is enable, the plugin will automatically update the fields of all selected blocks with the
same type. This can cause issues when you have multiple field on a block and one field is dependent on another. 
For example, if you have a block with a dropdown field and another, dependent, field which is programmatically updated 
(e.g. in the dropdown field's validator) based on the value of the dropdown field, then the
 multi-field update may interfere with the programmatic update.  In this situation, you only want to multi-field
update to update the dropdown fields. To do this, you can use the `Multiselect.withoutMultiFieldUpdates` wrapper function
within the function which updates the dependent field.  It allows you to temporarily turn off the multi-field update within the
scope of its wrapped input function.

## Cross-tested with the following plugins:
**Original**
- [x] Scroll-options plugin
- [x] Backpack (Need to update UI in Backpack plugin side)

**Workspace-related**
- [x] Keyboard-navigation
- [x] Shadow-block-converter
- [x] Workspace-content-highlight
- [x] Disable-top-blocks
- [x] Plugin-strict-connection-checker

**Blocks-related**
- [x] Block-dynamic-connection
- [x] Block-shareable-procedures
- [x] Block-test

For more information, please check out the following [issue page](https://github.com/mit-cml/workspace-multiselect/issues/50).

### Note on keyboard navigation plugin
Currently, the keyboard navigation plugin has no compatibility issues with the multiselect plugin. It is enabled by default
in the test files. However, one thing that developers and users should note is that the regular Blockly core's copy/cut/paste shortcuts 
and multiselect plugin's copy/cut/paste shortcuts are completely disabled when the keyboard navigation mode is turned on. This was assumed
to be the expected behavior of the user as it defeats the purpose of having the keyboard navigation mode turned on and the user would try to
select blocks using the cursor and copy/cut/paste with that selection. However, if a developer wants to allow for either copy/cut/paste behavior
(Blockly Core or multiselect plugin) while the keyboard navigation mode is turned on, we would have to make the following changes described in this
[issue](https://github.com/google/blockly-samples/issues/2424).

### Note on disable top blocks plugin
The disable top blocks plugin has to be initialized after the multiselect plugin. The main reason behind this is that 
the multiselect plugin has its own custom context menu, which allows for the disabling of any blocks (not just top blocks).
Installing the multiselect plugin after the disable top blocks plugin overrides the disable top blocks plugin's context menu
customization. If we install the disable top blocks plugin after the multiselect plugin, everything works as intended.

## API

- `Multiselect.init`: Initialize the plugin.
- `Multiselect.dispose`: Dispose the plugin.
- `MultiselectDraggable`: The customized draggable object unique to each workspace that contains the blocks in the multiselection.
- `dragSelectionWeakMap`: The WeakMap storing set of currently selected block ids by workspace svg.
- `inMultipleSelectionModeWeakMap`: The WeakMap storing whether the plugin is in multiple selection mode by workspace svg.
- `Multiselect.withoutMultiFieldUpdates`: A wrapper function to ignore multi-field updates.
- `Multiselect.setMultiselectIcon`: Pass in the icon URLs/data to change the multiselect icon at runtime.

## Credit
- [DragSelect](https://github.com/ThibaultJanBeyer/DragSelect): This plugin uses DragSelect to realize the "drag a rectangle to select multiple blocks" feature. The patching PR [#143](https://github.com/ThibaultJanBeyer/DragSelect/pull/143) and [#165](https://github.com/ThibaultJanBeyer/DragSelect/pull/165) made all this possible, and these PRs are included in [v2.6.0](https://github.com/ThibaultJanBeyer/DragSelect/releases/tag/v2.6.0).
- [select.svg](test/media/select.svg) & [unselect.svg](test/media/unselect.svg): Free icons downloaded at [Icons8](https://icons8.com).
- This plugin is part of the achievement by Songlin Jiang([@HollowMan6](https://github.com/HollowMan6)) participating the [Google Summer of Code 2022](https://summerofcode.withgoogle.com/programs/2022/projects/9wF06HWE) at [MIT App Inventor](https://github.com/mit-cml).
- This plugin was updated for Blockly-v11 and cross-checked with other Blockly plugins by Chang Min Bark([@changminbark](https://github.com/changminbark)) participating the [Google Summer of Code 2024](https://summerofcode.withgoogle.com/archive/2024/projects/9916Xzin) at [MIT App Inventor](https://github.com/mit-cml).
- Thanks for the sponsor from [@zakx](https://github.com/zakx) & [@laurensvalk](https://github.com/laurensvalk).

## License
Apache 2.0
