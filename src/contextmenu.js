/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection context menu.
 */

import * as Blockly from 'blockly/core';
import {blockSelection, hasSelectedParent} from './global';

/**
 * Modification for context menu 'Duplicate' to be available for
 * multiple blocks.
 */
const registerDuplicate = function() {
  const duplicateOption = {
    displayText: function() {
      const selectedBlocksLength = blockSelection.size;
      if (selectedBlocksLength <= 1) {
        return Blockly.Msg['DUPLICATE_BLOCK'];
      } else {
        return Blockly.Msg['DUPLICATE_BLOCK'] + ' (' +
        selectedBlocksLength + ')';
      }
    },
    preconditionFn: function(scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isDeletable() && block.isMovable()) {
        if (block.isDuplicatable()) {
          return 'enabled';
        }
        return 'disabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
      const duplicatedBlocks = [];
      const apply = function(block) {
        if (block && duplicateOption.preconditionFn({
          block: block,
        }) === 'enabled' && !hasSelectedParent(block)) {
          duplicatedBlocks.push(Blockly.clipboard.duplicate(block));
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
          block.pathObject.updateSelected(false);
        }
      });
      Blockly.Events.setGroup(false);
      blockSelection.clear();
      duplicatedBlocks.forEach(function(block) {
        if (block.id) {
          blockSelection.add(block.id);
          block.pathObject.updateSelected(true);
        }
      });
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDuplicate',
    weight: 1,
  };
  Blockly.ContextMenuRegistry.registry.register(duplicateOption);
};

/**
 * Modification for context menu 'Comment' to be available for multiple blocks.
 */
const registerComment = function() {
  const commentOption = {
    displayText: function(scope) {
      const selectedBlocksLength = blockSelection.size;
      if (scope.block.getCommentIcon()) {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['REMOVE_COMMENT'];
        } else {
          return Blockly.Msg['REMOVE_COMMENT'] + ' (' +
          selectedBlocksLength + ')';
        }
      }
      if (selectedBlocksLength <= 1) {
        return Blockly.Msg['ADD_COMMENT'];
      } else {
        return Blockly.Msg['ADD_COMMENT'] + ' (' +
        selectedBlocksLength + ')';
      }
    },
    preconditionFn: function(scope) {
      const block = scope.block;
      if (!Blockly.utils.userAgent.IE && !block.isInFlyout &&
        block.workspace.options.comments && !block.isCollapsed() &&
        block.isEditable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
      const hasCommentIcon = scope.block.getCommentIcon();
      const apply = function(block) {
        if (block && commentOption.preconditionFn({
          block: block,
        }) === 'enabled') {
          if (hasCommentIcon) {
            block.setCommentText(null);
          } else {
            block.setCommentText('');
          }
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
        }
      });
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockComment',
    weight: 2,
  };
  Blockly.ContextMenuRegistry.registry.register(commentOption);
};

/**
 * Modification for context menu 'Inline' to be available for multiple blocks.
 */
const registerInline = function() {
  const inlineOption = {
    displayText: function(scope) {
      const selectedBlocksLength = blockSelection.size;
      if (scope.block.getInputsInline()) {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['EXTERNAL_INPUTS'];
        } else {
          return Blockly.Msg['EXTERNAL_INPUTS'] + ' (' +
          selectedBlocksLength + ')';
        }
      } else {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['INLINE_INPUTS'];
        } else {
          return Blockly.Msg['INLINE_INPUTS'] + ' (' +
          selectedBlocksLength + ')';
        }
      }
    },
    preconditionFn: function(scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isMovable() && !block.isCollapsed()) {
        for (let i = 1; i < block.inputList.length; i++) {
          // Only display this option if there are two value or dummy inputs
          // next to each other.
          if (block.inputList[i - 1].type !== Blockly.inputTypes.STATEMENT &&
            block.inputList[i].type !== Blockly.inputTypes.STATEMENT) {
            return 'enabled';
          }
        }
      }
      return 'hidden';
    },
    callback: function(scope) {
      const state = !scope.block.getInputsInline();
      const apply = function(block) {
        if (block && inlineOption.preconditionFn({
          block: block,
        }) === 'enabled') {
          block.setInputsInline(state);
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
        }
      });
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockInline',
    weight: 3,
  };
  Blockly.ContextMenuRegistry.registry.register(inlineOption);
};

/**
 * Modification for context menu 'Collapse/Expand' to be available for
 * multiple blocks.
 */
const registerCollapseExpandBlock = function() {
  const collapseExpandOption = {
    displayText: function(scope) {
      const selectedBlocksLength = blockSelection.size;
      if (scope.block.isCollapsed()) {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['EXPAND_BLOCK'];
        } else {
          return Blockly.Msg['EXPAND_BLOCK'] + ' (' +
          selectedBlocksLength + ')';
        }
      } else {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['COLLAPSE_BLOCK'];
        } else {
          return Blockly.Msg['COLLAPSE_BLOCK'] + ' (' +
          selectedBlocksLength + ')';
        }
      }
    },
    preconditionFn: function(scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.isMovable() &&
        block.workspace.options.collapse) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
      const state = !scope.block.isCollapsed();
      const apply = function(block) {
        if (block && collapseExpandOption.preconditionFn({
          block: block,
        }) === 'enabled' && !hasSelectedParent(block)) {
          block.setCollapsed(state);
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
        }
      });
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockCollapseExpand',
    weight: 4,
  };
  Blockly.ContextMenuRegistry.registry.register(collapseExpandOption);
};

/**
 * Modification for context menu 'Disable' to be available for multiple blocks.
 */
const registerDisable = function() {
  const disableOption = {
    displayText: function(scope) {
      const selectedBlocksLength = blockSelection.size;
      if (scope.block.isEnabled()) {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['DISABLE_BLOCK'];
        } else {
          return Blockly.Msg['DISABLE_BLOCK'] + ' (' +
          selectedBlocksLength + ')';
        }
      } else {
        if (selectedBlocksLength <= 1) {
          return Blockly.Msg['ENABLE_BLOCK'];
        } else {
          return Blockly.Msg['ENABLE_BLOCK'] + ' (' +
          selectedBlocksLength + ')';
        }
      }
    },
    preconditionFn: function(scope) {
      const block = scope.block;
      if (!block.isInFlyout && block.workspace.options.disable &&
        block.isEditable()) {
        if (block.getInheritedDisabled()) {
          return 'disabled';
        }
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
      const state = !scope.block.isEnabled();
      const apply = function(block) {
        if (block && disableOption.preconditionFn({
          block: block,
        }) === 'enabled' && !hasSelectedParent(block)) {
          block.setEnabled(state);
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
        }
      });
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDisable',
    weight: 5,
  };
  Blockly.ContextMenuRegistry.registry.register(disableOption);
};

/**
 * Modification for context menu 'Delete' to be available for multiple blocks.
 */
const registerDelete = function() {
  const deleteOption = {
    displayText: function() {
      let descendantCount = 0;
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          // Count the number of blocks that are nested in this block.
          descendantCount += block.getDescendants(false).length;
          const nextBlock = block.getNextBlock();
          if (nextBlock) {
            // Blocks in the current stack would survive this block's deletion.
            descendantCount -= nextBlock.getDescendants(false).length;
          }
        }
      });
      return (descendantCount === 1) ?
        Blockly.Msg['DELETE_BLOCK'] :
        Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(descendantCount));
    },
    preconditionFn: function(scope) {
      if (!scope.block.isInFlyout && scope.block.isDeletable()) {
        return 'enabled';
      }
      return 'hidden';
    },
    callback: function(scope) {
      const apply = function(block) {
        if (block && deleteOption.preconditionFn({
          block: block,
        }) === 'enabled' && !hasSelectedParent(block)) {
          if (block.workspace.isFlyout) {
            return;
          }
          block.workspace.hideChaff();
          if (block.outputConnection) {
            block.dispose(false, true);
          } else {
            block.dispose(true, true);
          }
        }
      };
      Blockly.Events.setGroup(true);
      if (scope.block && blockSelection.size === 0) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = Blockly.getMainWorkspace().getBlockById(id);
        if (block) {
          apply(block);
        }
      });
      Blockly.Events.setGroup(false);
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    id: 'blockDelete',
    weight: 6,
  };
  Blockly.ContextMenuRegistry.registry.register(deleteOption);
};

/**
 * Add context menu 'Select all Blocks' for workspace.
 */
const registerSelectAll = function() {
  const selectAllOption = {
    displayText: function() {
      return 'Select all Blocks';
    },
    preconditionFn: function(scope) {
      const topBlocks = scope.workspace.getTopBlocks(false);
      for (let i = 0; i < topBlocks.length; i++) {
        let block = topBlocks[i];
        while (block) {
          if (block.isDeletable() &&
          block.isMovable()) {
            return 'enabled';
          }
          block = block.getNextBlock();
        }
      }
      return 'disabled';
    },
    callback: function(scope) {
      if (Blockly.selected) {
        Blockly.selected.pathObject.updateSelected(false);
        Blockly.common.setSelected(null);
      }
      scope.workspace.getTopBlocks().forEach(function(block) {
        if (block &&
          block.isDeletable() &&
          block.isMovable() &&
          !block.pathObject.svgRoot.classList.contains(
              'blocklyInsertionMarker')) {
          blockSelection.add(block.id);
          if (!Blockly.common.getSelected()) {
            Blockly.common.setSelected(block);
          }
          block.pathObject.updateSelected(true);
        }
      });
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
    id: 'workspaceSelectAll',
    weight: 5,
  };
  Blockly.ContextMenuRegistry.registry.register(selectAllOption);
};

/**
 * Unregister context menu item, should be called before registering.
 */
export const unregisterContextMenu = function() {
  Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');
  Blockly.ContextMenuRegistry.registry.unregister('blockComment');
  Blockly.ContextMenuRegistry.registry.unregister('blockInline');
  Blockly.ContextMenuRegistry.registry.unregister('blockCollapseExpand');
  Blockly.ContextMenuRegistry.registry.unregister('blockDisable');
  Blockly.ContextMenuRegistry.registry.unregister('blockDelete');
};

/**
 * Register default context menu item.
 */
export const registerOrigContextMenu = function() {
  Blockly.ContextMenuItems.registerDuplicate();
  Blockly.ContextMenuItems.registerComment();
  Blockly.ContextMenuItems.registerInline();
  Blockly.ContextMenuItems.registerCollapseExpandBlock();
  Blockly.ContextMenuItems.registerDisable();
  Blockly.ContextMenuItems.registerDelete();
};

/**
 * Registers all modified context menu item.
 */
export const registerOurContextMenu = function() {
  registerDuplicate();
  registerComment();
  registerInline();
  registerCollapseExpandBlock();
  registerDisable();
  registerDelete();
  registerSelectAll();
};
