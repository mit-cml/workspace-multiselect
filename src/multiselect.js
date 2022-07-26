/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin main class.
 */

import * as Blockly from 'blockly/core';

import * as ContextMenu from './multiselect_contextmenu';
import * as Shortcut from './multiselect_shortcut';
import {blockSelectionWeakMap, inMultipleSelectionModeWeakMap,
    hasSelectedParent, BaseBlockDraggerWeakMap} from './global';
import {MultiselectControls} from './multiselect_controls';

/**
 * Class for using multiple select blocks on workspace.
 */
export class Multiselect {
  /**
   * Initalize the class data structure.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
   */
  constructor(workspace) {
    this.workspace_ = workspace;
    this.origHandleWsStart_ = Blockly.Gesture.prototype.handleWsStart;

    blockSelectionWeakMap.set(this.workspace_, new Set());
    inMultipleSelectionModeWeakMap.set(this.workspace_, false);
    BaseBlockDraggerWeakMap.set(this.workspace_, Blockly.BlockDragger);
  }

  /**
   * Bind the events and replace registration.
   * @param {{multiselectIcon: Object, useDoubleClick: boolean}} options
   * to set.
   */
  init(options) {
    this.onKeyDownWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.getInjectionDiv(), 'keydown', this, this.onKeyDown_);
    this.onKeyUpWrapper_ = Blockly.browserEvents.conditionalBind(
        globalThis['window'], 'blur', this, this.onBlur_);
    this.onKeyUpWrapper_ = Blockly.browserEvents.conditionalBind(
        this.workspace_.getInjectionDiv(), 'keyup', this, this.onKeyUp_);
    this.eventListenerWrapper_ = this.eventListener_.bind(this);
    this.workspace_.addChangeListener(this.eventListenerWrapper_);

    if (!Blockly.ContextMenuRegistry.registry.registry_.workspaceSelectAll) {
      ContextMenu.unregisterContextMenu();
      ContextMenu.registerOurContextMenu();
      Shortcut.unregisterShortcut();
      Shortcut.registerOurShortcut();
    }

    this.controls_ = new MultiselectControls(
        this.workspace_, options.multiselectIcon, this);
    if (!options.multiselectIcon || !options.multiselectIcon.hideIcon) {
      const svgControls = this.controls_.createDom();
      this.workspace_.getParentSvg().appendChild(svgControls);
    }
    this.controls_.init();

    if (options.useDoubleClick) {
      this.useDoubleClick_(true);
    }

    if (options.baseBlockDragger) {
      BaseBlockDraggerWeakMap.set(this.workspace_, options.baseBlockDragger);
    }

    if (!options.bumpNeighbours) {
      this.origBumpNeighbours = Blockly.BlockSvg.prototype.bumpNeighbours;
      Blockly.BlockSvg.prototype.bumpNeighbours = function() {};
    }
  }

  /**
   * Unbind the events and replace with original registration.
   * @param {boolean} keepRegistry Keep the context menu and shortcut registry.
   */
  dispose(keepRegistry = false) {
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
    if (!keepRegistry) {
      ContextMenu.unregisterContextMenu();
      Blockly.ContextMenuRegistry.registry.unregister('workspaceSelectAll');
      ContextMenu.registerOrigContextMenu();

      Shortcut.unregisterShortcut();
      Blockly.ShortcutRegistry.registry.unregister('selectall');
      Shortcut.registerOrigShortcut();
    }

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
   * Add double click to expand/collapse blocks (MIT App Inventor Supported).
   * @param {!boolean} on Whether to turn on the mode.
   * @private
   */
  useDoubleClick_(on) {
    if (!on) {
      Blockly.Gesture.prototype.handleWsStart = this.origHandleWsStart_;
      return;
    }

    Blockly.Gesture.prototype.handleWsStart = (function(func) {
      if (func.isWrapped) {
        return func;
      }

      const wrappedFunc = function(e, ws) {
        func.call(this, e, ws);
        if (this.targetBlock_ && e.buttons === 1 &&
            !inMultipleSelectionModeWeakMap.get(this.workspace_)) {
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
                const maybeCollapse = function(block) {
                  if (block && preCondition(block) &&
                  !hasSelectedParent(block)) {
                    block.setCollapsed(state);
                  }
                };
                Blockly.Events.setGroup(true);
                const blockSelection = blockSelectionWeakMap.get(ws);
                if (Blockly.selected && !blockSelection.size) {
                  maybeCollapse(Blockly.selected);
                }
                blockSelection.forEach(function(id) {
                  const block = ws.getBlockById(id);
                  if (block) {
                    maybeCollapse(block);
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
    })(Blockly.Gesture.prototype.handleWsStart);
  }

  /**
   * Handle workspace events.
   * @param {!Event} e Blockly event.
   * @private
   */
  eventListener_(e) {
    // on Block Selected
    if (e.type === Blockly.Events.SELECTED) {
      this.controls_.updateMultiselect();
    }
  }

  /**
   * Handle a key-down on the workspace.
   * @param {KeyboardEvent} e The keyboard event.
   * @private
   */
  onKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.SHIFT &&
        !inMultipleSelectionModeWeakMap.get(this.workspace_)) {
      this.controls_.enableMultiselect();
    }
  }

  /**
   * Handle a key-up on the workspace.
   * @param {KeyboardEvent} e The keyboard event.
   * @private
   */
  onKeyUp_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.SHIFT) {
      this.controls_.disableMultiselect();
    }
  }

  /**
   * Handle a blur on the workspace.
   * @private
   */
  onBlur_() {
    if (inMultipleSelectionModeWeakMap.get(this.workspace_)) {
      this.controls_.disableMultiselect();
    }
  }
}
