/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import {Multiselect} from '../src/index';
import {multiDraggableWeakMap} from '../src/global';
window.multiDraggableWeakMap = multiDraggableWeakMap;
import {Backpack} from '@blockly/workspace-backpack';
import {KeyboardNavigation} from '@blockly/keyboard-navigation';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @returns {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  // Initialize backpack plugin.
  const backpack = new Backpack(workspace);
  backpack.init();

  // Work around backpack plugin bug where its configureContextMenu clears
  // all menu items for non-PointerEvent events (e.g. keyboard nav).
  const origConfigureContextMenu = workspace.configureContextMenu;
  workspace.configureContextMenu = (menuOptions, event) => {
    if (event instanceof PointerEvent) {
      origConfigureContextMenu.call(null, menuOptions, event);
    }
  };

  // Initialize multiselect plugin.
  const multiselectPlugin = new Multiselect(workspace);
  multiselectPlugin.init(options);

  // Initialize keyboard navigation plugin.
  new KeyboardNavigation(workspace, {allowCrossWorkspacePaste: true});
  multiselectPlugin.onKeyboardNavigationInit();

  return workspace;
}

Blockly.ContextMenuItems.registerCommentOptions();
KeyboardNavigation.registerKeyboardNavigationStyles();
class NavigationDeferringToolbox extends Blockly.Toolbox {
  onKeyDown_() {}
}
Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX,
    Blockly.registry.DEFAULT,
    NavigationDeferringToolbox,
    true,
);
KeyboardNavigation.registerFlyoutCursor();

Blockly.Blocks['radix'] = {
  init() {
    this.appendDummyInput()
        .appendField(
            new Blockly.FieldDropdown([['decimal', 'DEC'], ['binary', 'BIN']]),
            'RADIX')
        .appendField(
            new Blockly.FieldTextInput('0'),
            'NUM');
    const radixes = {DEC: 10, BIN: 2};
    this.getField('RADIX').setValidator(function(newValue) {
      const block = this.getSourceBlock();
      const oldNum = parseInt(block.getFieldValue('NUM'), radixes[this.getValue()]);
      const newNum = oldNum.toString(radixes[newValue]);
      Multiselect.withoutMultiFieldUpdates(() => {
        block.setFieldValue(newNum, 'NUM');
      });
    });
  },
};

Blockly.Blocks['validator_call_counter'] = {
  init() {
    this.appendDummyInput()
        .appendField(
            new Blockly.FieldDropdown([['a', 'A'], ['b', 'B']]),
            'VALUE');
    this.getField('VALUE').setValidator(function() {
      const validatorCallCounts = window.validatorCallCounts ??= {};
      const id = this.getSourceBlock().id;
      validatorCallCounts[id] = (validatorCallCounts[id] || 0) + 1;
    });
  },
};

document.addEventListener('DOMContentLoaded', function() {
  toolboxCategories.contents.push({
    name: 'Test',
    kind: 'category',
    contents: [
      {type: 'radix', kind: 'block'},
      {type: 'validator_call_counter', kind: 'block'},
    ],
  });

  const defaultOptions = {
    toolbox: toolboxCategories,
    useDoubleClick: true,
    bumpNeighbours: false,
    multiFieldUpdate: true,
    multiselectIcon: {
      hideIcon: false,
      weight: 3,
      enabledIcon: 'media/select.svg',
      disabledIcon: 'media/unselect.svg',
    },
    multiSelectKeys: ['Shift'],
    multiselectCopyPaste: {
      crossTab: true,
      menu: false,
    },
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
    move: {
      wheel: true,
    },
    zoom: {
      wheel: true,
    },
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
