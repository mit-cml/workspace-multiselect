/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection context menu.
 */

import * as Blockly from 'blockly/core';
import {blockSelectionWeakMap, hasSelectedParent} from './global';

/**
 * Modification for context menu 'Duplicate' to be available for
 * multiple blocks.
 */
const registerDuplicate = function() {
  const duplicateOption = {
    displayText: function(scope) {
      let workableBlocksLength = 0;
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (duplicateOption.check(block)) {
          workableBlocksLength++;
        }
      });
      if (workableBlocksLength <= 1) {
        return Blockly.Msg['DUPLICATE_BLOCK'];
      } else {
        return Blockly.Msg['DUPLICATE_X_BLOCKS']?
            Blockly.Msg['DUPLICATE_X_BLOCKS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['DUPLICATE_BLOCK'] + ' (' +
            workableBlocksLength + ')';
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
    // Only duplicate-able blocks will be duplicated.
    check: function(block) {
      return block &&
             duplicateOption.preconditionFn({block: block}) === 'enabled' &&
             !hasSelectedParent(block);
    },
    callback: function(scope) {
      const duplicatedBlocks = [];
      const apply = function(block) {
        if (duplicateOption.check(block)) {
          duplicatedBlocks.push(Blockly.clipboard.duplicate(block));
        }
        block.pathObject.updateSelected(false);
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
      let workableBlocksLength = 0;
      const state = scope.block.getCommentIcon();
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (commentOption.check(block) &&
            (block.getCommentIcon() instanceof Blockly.Comment) ===
            (state instanceof Blockly.Comment)) {
          workableBlocksLength++;
        }
      });
      if (state) {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['REMOVE_COMMENT'];
        } else {
          return Blockly.Msg['REMOVE_X_COMMENTS']?
            Blockly.Msg['REMOVE_X_COMMENTS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['REMOVE_COMMENT'] + ' (' +
            workableBlocksLength + ')';
        }
      } else {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['ADD_COMMENT'];
        } else {
          return Blockly.Msg['ADD_X_COMMENTS']?
            Blockly.Msg['ADD_X_COMMENTS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['ADD_COMMENT'] + ' (' +
            workableBlocksLength + ')';
        }
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
    check: function(block) {
      return block &&
             commentOption.preconditionFn({block: block}) === 'enabled';
    },
    callback: function(scope) {
      const hasCommentIcon = scope.block.getCommentIcon();
      const apply = function(block) {
        if (commentOption.check(block)) {
          if (hasCommentIcon) {
            block.setCommentText(null);
          } else {
            block.setCommentText('');
          }
        }
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
      let workableBlocksLength = 0;
      const state = scope.block.getInputsInline();
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (inlineOption.check(block) &&
            block.getInputsInline() === state) {
          workableBlocksLength++;
        }
      });
      if (state) {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['EXTERNAL_INPUTS'];
        } else {
          return Blockly.Msg['EXTERNAL_X_INPUTS']?
            Blockly.Msg['EXTERNAL_X_INPUTS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['EXTERNAL_INPUTS'] + ' (' +
            workableBlocksLength + ')';
        }
      } else {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['INLINE_INPUTS'];
        } else {
          return Blockly.Msg['INLINE_X_INPUTS']?
            Blockly.Msg['INLINE_X_INPUTS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['INLINE_INPUTS'] + ' (' +
            workableBlocksLength + ')';
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
    check: function(block) {
      return block &&
             inlineOption.preconditionFn({block: block}) === 'enabled';
    },
    callback: function(scope) {
      const state = !scope.block.getInputsInline();
      const apply = function(block) {
        if (inlineOption.check(block)) {
          block.setInputsInline(state);
        }
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
      let workableBlocksLength = 0;
      const state = scope.block.isCollapsed();
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (collapseExpandOption.check(block) &&
            block.isCollapsed() === state) {
          workableBlocksLength++;
        }
      });
      if (state) {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['EXPAND_BLOCK'];
        } else {
          return Blockly.Msg['EXPAND_X_BLOCKS']?
            Blockly.Msg['EXPAND_X_BLOCKS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['EXPAND_BLOCK'] + ' (' +
            workableBlocksLength + ')';
        }
      } else {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['COLLAPSE_BLOCK'];
        } else {
          return Blockly.Msg['COLLAPSE_X_BLOCKS']?
            Blockly.Msg['COLLAPSE_X_BLOCKS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['COLLAPSE_BLOCK'] + ' (' +
            workableBlocksLength + ')';
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
    check: function(block) {
      return block &&
             collapseExpandOption.preconditionFn({block: block}) ===
             'enabled' && (!hasSelectedParent(block) ||
             block.isCollapsed());
    },
    callback: function(scope) {
      const state = !scope.block.isCollapsed();
      const apply = function(block) {
        if (collapseExpandOption.check(block)) {
          block.setCollapsed(state);
        }
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
      let workableBlocksLength = 0;
      const state = scope.block.isEnabled();
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (disableOption.check(block) &&
            block.isEnabled() === state) {
          workableBlocksLength++;
        }
      });
      if (state) {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['DISABLE_BLOCK'];
        } else {
          return Blockly.Msg['DISABLE_X_BLOCKS']?
            Blockly.Msg['DISABLE_X_BLOCKS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['DISABLE_BLOCK'] + ' (' +
            workableBlocksLength + ')';
        }
      } else {
        if (workableBlocksLength <= 1) {
          return Blockly.Msg['ENABLE_BLOCK'];
        } else {
          return Blockly.Msg['ENABLE_X_BLOCKS']?
            Blockly.Msg['ENABLE_X_BLOCKS'].replace(
                '%1', workableBlocksLength) :
            Blockly.Msg['ENABLE_BLOCK'] + ' (' +
            workableBlocksLength + ')';
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
    check: function(block) {
      return block &&
             disableOption.preconditionFn({block: block}) === 'enabled' &&
             (!hasSelectedParent(block) || !block.isEnabled());
    },
    callback: function(scope) {
      const state = !scope.block.isEnabled();
      const apply = function(block) {
        if (disableOption.check(block)) {
          block.setEnabled(state);
        }
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
    displayText: function(scope) {
      let descendantCount = 0;
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        if (block && !hasSelectedParent(block)) {
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
    check: function(block) {
      return block && !block.workspace.isFlyout &&
             deleteOption.preconditionFn({block: block}) === 'enabled' &&
             !hasSelectedParent(block);
    },
    callback: function(scope) {
      const apply = function(block) {
        if (deleteOption.check(block)) {
          block.workspace.hideChaff();
          if (block.outputConnection) {
            block.dispose(false, true);
          } else {
            block.dispose(true, true);
          }
        }
      };
      const blockSelection = blockSelectionWeakMap.get(scope.block.workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(scope.block);
      }
      blockSelection.forEach(function(id) {
        const block = scope.block.workspace.getBlockById(id);
        apply(block);
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
      return scope.workspace.getTopBlocks().some(
          (b) => selectAllOption.check(b)) ? 'enabled' : 'disabled';
    },
    check: function(block) {
      return block &&
             (block.isDeletable() || block.isMovable()) &&
             !block.isInsertionMarker();
    },
    callback: function(scope) {
      const blockSelection = blockSelectionWeakMap.get(scope.workspace);
      if (Blockly.selected && !blockSelection.has(Blockly.selected.id)) {
        Blockly.selected.pathObject.updateSelected(false);
        Blockly.common.setSelected(null);
      }

      scope.workspace.getTopBlocks().forEach(function(block) {
        if (selectAllOption.check(block)) {
          blockSelectionWeakMap.get(block.workspace).add(block.id);
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
