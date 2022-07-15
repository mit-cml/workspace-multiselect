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
import {WorkspaceMultiSelect, MultiSelectBlockDragger} from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  const multiSelectPlugin = new WorkspaceMultiSelect(workspace);
  multiSelectPlugin.init(options);

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    useDoubleClick: true,
    multiSelectIcon: {
      enabled: true,
      enabledIcon: 'media/select.svg',
      disabledIcon: 'media/unselect.svg',
    },
    zoom: {
      wheel: true,
    },
    plugins: {
      'blockDragger': MultiSelectBlockDragger,
    },
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
