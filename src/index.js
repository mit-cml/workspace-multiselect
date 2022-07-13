/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin main class.
 */

import * as Blockly from 'blockly/core';

import DragSelect from '../lib/ds.min';

import * as ContextMenu from './contextmenu';
import * as Shortcut from './shortcut';
import {blockSelection, inMultipleSelectionMode, setSelectionMode,
  origHandleWsStart, hasSelectedParent} from './global';
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
   * @param {!Blockly.BlocklyOptions} options to set.
   */
  init(options) {
    this.onKeyDownWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.injectionDiv_, 'keydown', this, this.onKeyDown_);
    this.onKeyUpWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.injectionDiv_, 'keyup', this, this.onKeyUp_);
    this.eventListenerWrapper_ = this.eventListener_.bind(this);
    this.workspace_.addChangeListener(this.eventListenerWrapper_);

    ContextMenu.unregisterContextMenu();
    ContextMenu.registerOurContextMenu();
    Shortcut.unregisterShortcut();
    Shortcut.registerOurShortcut();

    if (options.multiSelectIcon) {
      this.controls_ = new MultiSelectControls(this.workspace_, this);
      const svgControls = this.controls_.createDom();
      this.workspace_.svgGroup_.appendChild(svgControls);
      this.controls_.init();
    }

    if (options.useDoubleClick) {
      this.useDoubleClick_(true);
    }

    this.origBumpNeighbours = Blockly.BlockSvg.prototype.bumpNeighbours;
    Blockly.BlockSvg.prototype.bumpNeighbours = function() {};
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
    Shortcut.unregisterShortcut();
    Blockly.ShortcutRegistry.registry.unregister('selectall');
    Shortcut.registerOrigShortcut();

    if (this.controls_) {
      this.controls_.dispose();
      this.controls_ = null;
    }

    this.useDoubleClick_(false);

    if (this.origBumpNeighbours) {
      Blockly.BlockSvg.prototype.bumpNeighbours = this.origBumpNeighbours;
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
   * Add double click to expand/collapse blocks (MIT App Inventor Supported).
   * @param {!boolean} on Whether to turn on the mode.
   * @private
   */
  useDoubleClick_(on) {
    if (on) {
      Blockly.Gesture.prototype.handleWsStart = (function(func) {
        if (func.isWrapped) {
          return func;
        } else {
          const wrappedFunc = function(e, ws) {
            func.call(this, e, ws);
            if (this.targetBlock_ && e.buttons == 1 &&
                (blockSelection.has(this.targetBlock_.id) &&
                blockSelection.size > 1 || blockSelection.size < 2)) {
              const preCondition = function(block) {
                return !block.isInFlyout && block.isMovable() &&
                block.workspace.options.collapse;
              };
              if (Blockly.selected && preCondition(Blockly.selected)) {
                if (ws.doubleClickPid_) {
                  clearTimeout(ws.doubleClickPid_);
                  ws.doubleClickPid_ = undefined;
                  if (Blockly.selected.id === ws.doubleClickBlock_) {
                    const state = !Blockly.selected.isCollapsed();
                    const apply = function(block) {
                      if (block && preCondition(block) &&
                      !hasSelectedParent(block)) {
                        block.setCollapsed(state);
                      }
                    };
                    Blockly.Events.setGroup(true);
                    if (Blockly.selected && !blockSelection.size) {
                      apply(Blockly.selected);
                    }
                    blockSelection.forEach(function(id) {
                      const block = ws.getBlockById(id);
                      if (block) {
                        apply(block);
                      }
                    });
                    Blockly.Events.setGroup(false);
                    return;
                  }
                }
                if (!ws.doubleClickPid_) {
                  ws.doubleClickBlock_ = Blockly.selected.id;
                  ws.doubleClickPid_ = setTimeout(function() {
                    ws.doubleClickPid_ = undefined;
                  }, 500);
                }
              }
            }
          };
          wrappedFunc.isWrapped = true;
          return wrappedFunc;
        }
      })(Blockly.Gesture.prototype.handleWsStart);
    } else {
      Blockly.Gesture.prototype.handleWsStart = origHandleWsStart;
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
        block.bringToFront();
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
            if (element) {
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
        if (blockSelection.size) {
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
        if (element) {
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
      if (!blockSelection.size && Blockly.selected) {
        Blockly.common.setSelected(null);
      } else if (blockSelection.size && !Blockly.selected) {
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
export {blockSelection};
