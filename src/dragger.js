/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection dragger.
 */

import * as Blockly from 'blockly/core';
import {blockSelection, inMultipleSelectionMode, hasSelectedParent,
  origHighlight} from './global';

/**
 * A block dragger that adds the functionality for multiple block to
 * be moved while someone is dragging it.
 */
export class MultiSelectBlockDragger extends Blockly.BlockDragger {
  /** @override */
  constructor(block, workspace) {
    super(block, workspace);
    this.block_ = block;
    this.workspace_ = workspace;
    this.group_ = '';
    this.blockDraggers_ = new Set();
  }

  /**
   * Prepares the block dragger for a new drag.
   * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer
   *     has moved from the position at the start of the drag, in pixel units.
   * @param {boolean} healStack Whether or not to heal the stack after
   *     disconnecting.
   */
  startDrag(currentDragDeltaXY, healStack) {
    if (inMultipleSelectionMode) {
      return;
    }

    const blockDraggerList = [];
    if (blockSelection.has(this.block_.id)) {
      blockSelection.forEach((id) => {
        const element = this.workspace_.getBlockById(id);
        if (!element) {
          blockSelection.delete(id);
          return;
        }
        // Only drag the parent if it is selected.
        if (hasSelectedParent(element)) {
          return;
        }
        blockDraggerList.push(new Blockly.BlockDragger(element,
            this.workspace_));
      });
    } else {
      // Dragging a new block that not in the selection list would
      // clear the multiple selections and only drag that block.
      blockSelection.forEach((id) => {
        const element = this.workspace_.getBlockById(id);
        if (element) {
          element.pathObject.updateSelected(false);
        }
      });
      blockSelection.clear();
      blockDraggerList.push(new Blockly.BlockDragger(this.block_,
          this.workspace_));
      this.block_.pathObject.updateSelected(true);
    }

    if (blockDraggerList.length > 1) {
      // Disabled the highlighting around connection for multiple blocks
      // dragging because of the bugs.
      Blockly.RenderedConnection.prototype.highlight = function() {};
    }

    blockDraggerList.forEach((blockDragger) => {
      blockDragger.startDrag(currentDragDeltaXY, healStack);
      this.blockDraggers_.add(blockDragger);
    });
  }

  /**
   * Moves the block to the specified location.
   * @param {!Event} e The mouseup/touchend event.
   * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer
   *     has moved from the position at the start of the drag, in pixel units.
   */
  drag(e, currentDragDeltaXY) {
    this.blockDraggers_.forEach(function(blockDragger_) {
      blockDragger_.drag(e, currentDragDeltaXY);
    });
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Finishes the block drag.
   * @param {!Event} e The mouseup/touchend event.
   * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer
   *     has moved from the position at the start of the drag, in pixel units.
   */
  endDrag(e, currentDragDeltaXY) {
    this.blockDraggers_.forEach((blockDragger_) => {
      if (Blockly.Events.getGroup()) {
        this.group_ = Blockly.Events.getGroup();
      } else {
        Blockly.Events.setGroup(this.group_);
      }
      blockDragger_.endDrag(e, currentDragDeltaXY);
    });
    if (this.blockDraggers_.size > 1) {
      // Restore the highlighting around connection for multiple blocks.
      Blockly.RenderedConnection.prototype.highlight = origHighlight;
    }
  }

  /**
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   * @return {!Array<!Blockly.BlockSvg>} A possibly empty list of insertion
   *     marker blocks.
   */
  getInsertionMarkers() {
    const insertionMarkers = [];
    this.blockDraggers_.forEach(function(blockDragger_) {
      insertionMarkers.push(...blockDragger_.getInsertionMarkers());
    });
    return insertionMarkers;
  }
}

Blockly.registry.register(Blockly.registry.Type.BLOCK_DRAGGER,
    'MultiSelectBlockDragger', MultiSelectBlockDragger);
