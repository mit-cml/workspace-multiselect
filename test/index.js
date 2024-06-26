/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories} from '@blockly/dev-tools';
import {Multiselect, MultiselectBlockDragger} from '../src/index';
import {ScrollOptions, ScrollBlockDragger, ScrollMetricsManager} from '@blockly/plugin-scroll-options';
import {Backpack} from '@blockly/workspace-backpack';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @returns {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  // Initialize plugin.
  const plugin = new ScrollOptions(workspace);
  plugin.init();

  const backpack = new Backpack(workspace);
  backpack.init();

  const multiselectPlugin = new Multiselect(workspace);
  multiselectPlugin.init(options);

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    useDoubleClick: true,
    bumpNeighbours: false,
    multiselectIcon: {
      hideIcon: false,
      weight: 3,
      enabledIcon: 'media/select.svg',
      disabledIcon: 'media/unselect.svg',
    },
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
    // baseBlockDragger: ScrollBlockDragger,
    plugins: {
      'blockDragger': ScrollBlockDragger,
      'metricsManager': ScrollMetricsManager,
    },
  };
  createWorkspace(document.getElementById('primaryDiv'),
      defaultOptions);
  createWorkspace(document.getElementById('secondaryDiv'),
      defaultOptions);
});
