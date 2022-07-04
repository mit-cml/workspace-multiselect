/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin main class.
 */

import * as Blockly from 'blockly/core';

import DragSelect from '../lib/ds.min';

import * as ContextMenu from './contextmenu';
import {blockSelection, inMultipleSelectionMode, setSelectionMode} from './global';
import {MultiSelectControls} from './switch';

/**
 * Class for using multiple select blocks on workspace.
 */
export class WorkspaceMultiSelect {
  /**
   * Initalize the class data structure.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
   */
  constructor(workspace) {
    this.workspace_ = workspace;
    this.hasDisableWorkspaceDrag_ = false;
    this.justDeletedBlock_ = null;
  }

  /**
   * Bind the events and replace registration.
   */
  init() {
    this.onKeyDownWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.injectionDiv_, 'keydown', this, this.onKeyDown_);
    this.onKeyUpWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.injectionDiv_, 'keyup', this, this.onKeyUp_);
    this.eventListenerWrapper_ = this.eventListener_.bind(this);
    this.workspace_.addChangeListener(this.eventListenerWrapper_);

    ContextMenu.unregisterContextMenu();
    ContextMenu.registerOurContextMenu();

    this.controls_ = new MultiSelectControls(this.workspace_, this);
    const svgControls = this.controls_.createDom();
    this.workspace_.svgGroup_.appendChild(svgControls);
    this.controls_.init();
  }

  /**
   * Unbind the events and replace with original registration.
   */
  dispose() {
    if (this.onKeyDownWrapper_) {
      Blockly.browserEvents.unbind(this.onKeyDownWrapper_);
      this.onKeyDownWrapper_ = null;
    }
    if (this.onKeyUpWrapper_) {
      Blockly.browserEvents.unbind(this.onKeyUpWrapper_);
      this.onKeyUpWrapper_ = null;
    }
    if (this.eventListenerWrapper_) {
      this.workspace_.removeChangeListener(this.eventListenerWrapper_);
      this.eventListenerWrapper_ = null;
    }

    ContextMenu.unregisterContextMenu();
    ContextMenu.registerOrigContextMenu();
    Blockly.ContextMenuRegistry.registry.unregister('workspaceSelectAll');

    if (this.controls_) {
      this.controls_.dispose();
      this.controls_ = null;
    }
  }

  /**
   * Switch the multiple selection mode.
   * @param {!boolean} on Whether to turn on the mode.
   */
  switchMultiSelect(on) {
    if (on) {
      this.onKeyDown_({keyCode: Blockly.utils.KeyCodes.SHIFT});
    } else {
      this.onKeyUp_({keyCode: Blockly.utils.KeyCodes.SHIFT});
    }
  }

  /**
   * Maintain the selected blocks set list when updating.
   * @param {!Blockly.BlockSvg} block The block to update.
   * @private
   */
  updateBlocks_(block) {
    if (block &&
      block.isDeletable() &&
      block.isMovable()) {
      if (blockSelection.has(block.id)) {
        blockSelection.delete(block.id);
        this.justDeletedBlock_ = block;
        block.pathObject.updateSelected(false);
      } else {
        blockSelection.add(block.id);
        this.justDeletedBlock_ = null;
        block.pathObject.updateSelected(true);
      }
      console.log(blockSelection);
    }
  }

  /**
   * Handle workspace events.
   * @param {!Event} e Blockly event.
   * @private
   */
  eventListener_(e) {
    // on Block Selected
    if (e.type === Blockly.Events.SELECTED) {
      if (!inMultipleSelectionMode) {
        if (!Blockly.selected ||
          (Blockly.selected && !blockSelection.has(Blockly.selected.id))) {
          // When not in multiple selection mode and Blockly selects a block not
          // in currently selected set or unselects, clear the selected set.
          blockSelection.forEach((id) => {
            const element = this.workspace_.getBlockById(id);
            if (element && !element.disposed) {
              element.pathObject.updateSelected(false);
            }
          });
          blockSelection.clear();
          this.updateBlocks_(Blockly.selected);
        }
      } else if (this.justDeletedBlock_ && Blockly.selected &&
        Blockly.selected.id === this.justDeletedBlock_.id) {
        // Update the Blockly selected block when that block is
        // no longer selected in our set.
        if (blockSelection.size > 0) {
          Blockly.common.setSelected(
              this.workspace_.getBlockById(blockSelection.keys().next().value));
        } else {
          Blockly.common.setSelected(null);
        }
        this.justDeletedBlock_.pathObject.updateSelected(false);
        this.justDeletedBlock_ = null;
      }
      // Update the selection highlight.
      blockSelection.forEach((id) => {
        const element = this.workspace_.getBlockById(id);
        if (element && !element.disposed) {
          element.pathObject.updateSelected(true);
        }
      });
    }
  }

  /**
   * Handle a key-down on the workspace.
   * @param {KeyboardEvent} e The keyboard event.
   * @private
   */
  onKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.SHIFT) {
      if (!inMultipleSelectionMode) {
        // Ensure that we only restore drag to move the workspace behavior
        // when it is enabled.
        if (!this.hasDisableWorkspaceDrag_ &&
          this.workspace_.options.moveOptions &&
          this.workspace_.options.moveOptions.drag) {
          this.workspace_.options.moveOptions.drag = false;
          this.hasDisableWorkspaceDrag_ = true;
        }
        this.dragSelect_ = new DragSelect({
          selectables: document.querySelectorAll(
              'g.blocklyDraggable:not(.blocklyInsertionMarker)' +
            '> path.blocklyPath'),
          area: document.querySelector('.blocklyWorkspace'),
          multiSelectMode: true,
          draggability: false,
          usePointerEvents: true,
        });
        this.dragSelect_.subscribe('elementselect', (info) => {
          const element = info.item.parentElement;
          if (inMultipleSelectionMode && element.dataset &&
            element.dataset.id) {
            this.updateBlocks_(
                this.workspace_.getBlockById(element.dataset.id));
          }
        });
        this.dragSelect_.subscribe('elementunselect', (info) => {
          const element = info.item.parentElement;
          if (inMultipleSelectionMode && element.dataset &&
            element.dataset.id) {
            this.updateBlocks_(
                this.workspace_.getBlockById(element.dataset.id));
          }
        });
        if (this.controls_) {
          this.controls_.updateMultiSelect(true);
        }
        setSelectionMode(true);
      }
    }
  }

  /**
   * Handle a key-up on the workspace.
   * @param {KeyboardEvent} e The keyboard event.
   * @private
   */
  onKeyUp_(e) {
    if (e.keyCode == Blockly.utils.KeyCodes.SHIFT) {
      setSelectionMode(false);
      if (this.dragSelect_) {
        this.dragSelect_.stop();
        this.dragSelect_ = null;
      }
      // Ensure that at least Blockly select one of the blocks in the
      // selection set, or clear the Blockly selection if our set is empty.
      if (blockSelection.size == 0 && Blockly.selected) {
        Blockly.common.setSelected(null);
      } else if (blockSelection.size > 0 && !Blockly.selected) {
        Blockly.common.setSelected(
            this.workspace_.getBlockById(blockSelection.keys().next().value));
      }
      if (this.hasDisableWorkspaceDrag_) {
        this.workspace_.options.moveOptions.drag = true;
        this.hasDisableWorkspaceDrag_ = false;
      }
      if (this.controls_) {
        this.controls_.updateMultiSelect(false);
      }
    }
  }
}

export * from './patch';
export * from './dragger';
