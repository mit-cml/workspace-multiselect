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
import {Backpack} from '@blockly/workspace-backpack';
import {NavigationController} from '@blockly/keyboard-navigation';

const navigationController = new NavigationController();
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

  navigationController.addWorkspace(workspace);

  // Initialize multiselect plugin.
  const multiselectPlugin = new Multiselect(workspace);
  multiselectPlugin.init(options);

  return workspace;
}

Blockly.ContextMenuItems.registerCommentOptions();
// Initialize keyboard nav plugin.
navigationController.init();

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
      menu: true,
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
