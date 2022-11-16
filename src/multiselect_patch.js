/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Patch the Blockly for this plugin.
 */

import * as Blockly from 'blockly/core';

/**
 * Disable the drag surface.
 * @override
 */
Blockly.WorkspaceSvg.prototype.getBlockDragSurface = function() {
  return null;
};
