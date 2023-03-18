/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Global data structure.
 */

import * as Blockly from 'blockly/core';

/**
 * Set for storing the current selected blockSvg ids.
 */
export const blockSelectionWeakMap = new WeakMap();

/**
 * Store the current selection mode.
 */
export const inMultipleSelectionModeWeakMap = new WeakMap();

/**
 * Store the base BlockDragger.
 */
export const BaseBlockDraggerWeakMap = new WeakMap();

/**
 * Check if the current selected blockSvg set already contains the parents.
 * @param {!Blockly.BlockSvg} block to check.
 * @param {boolean} move Whether or not in moving.
 * @returns {boolean} true if the block's parents are selected.
 */
export const hasSelectedParent = function(block, move = false) {
  while (block) {
    if (move) {
      block = block.getParent();
    } else {
      block = block.getSurroundParent();
    }

    if (block && blockSelectionWeakMap.get(block.workspace).has(block.id)) {
      return true;
    }
  }
  return false;
};
