/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Global data structure.
 */

/**
 * Store the current selected blockSvg set.
 */
export const blockSelection = new Set();

/**
 * Check if the current selected blockSvg set already contains the parents.
 * @param {!Blockly.BlockSvg} block to check.
 * @return {boolean} true if the block's parents are selected.
 */
export const hasSelectedParent = function(block) {
  while (block) {
    block = block.parentBlock_;
    if (block && blockSelection.has(block.id)) {
      return true;
    }
  }
  return false;
};
