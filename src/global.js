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
export const blockSelection = new Set();

/**
 * Store the current selection mode.
 */
export let inMultipleSelectionMode = false;

/**
 * Set the inMultipleSelectionMode.
 * @param {boolean} isMultiple selection mode.
 */
export const setSelectionMode = function(isMultiple) {
  inMultipleSelectionMode = isMultiple;
};

/**
 * Store the base BlockDragger.
 */
export let BaseBlockDragger = Blockly.BlockDragger;

/**
 * Set the base block dragger.
 * @param {!Blockly.BlockDragger} func to use as the base block dragger.
 */
export const setBaseBlockDragger = function(func) {
  BaseBlockDragger = func;
};

/**
 * Check if the current selected blockSvg set already contains the parents.
 * @param {!Blockly.BlockSvg} block to check.
 * @return {boolean} true if the block's parents are selected.
 */
export const hasSelectedParent = function(block) {
  while (block) {
    block = block.getParent();
    if (block && blockSelection.has(block.id)) {
      return true;
    }
  }
  return false;
};
