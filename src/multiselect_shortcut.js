/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection shortcut.
 */

import * as Blockly from 'blockly/core';
import {
  dragSelectionWeakMap, hasSelectedParent, copyData, connectionDBList,
  dataCopyToStorage, dataCopyFromStorage, registeredShortcut,
  multiDraggableWeakMap, inPasteShortcut, getByID,
} from './global';
import {MultiselectDraggable} from './multiselect_draggable';

/**
 * Modification for keyboard shortcut 'Delete' to be available
 * for multiple blocks.
 */
const registerShortcutDelete = function() {
  const name = Blockly.ShortcutItems.names.DELETE;
  const deleteShortcut = {
    name,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      if (selected && selected.isInMutator) {
        // Blocks in the mutator workspace are always deletable.
        return selected.isDeletable();
      }
      const dragSelection = dragSelectionWeakMap.get(workspace);
      if (!dragSelection.size) {
        return deleteShortcut.check(selected);
      }
      for (const id of dragSelection) {
        const element = getByID(workspace, id);
        if (deleteShortcut.check(element)) {
          return true;
        }
      }
      return false;
    },
    check: function(element) {
      if (element instanceof Blockly.BlockSvg) {
        return element && element.isDeletable() &&
            !element.workspace.isFlyout &&
            !hasSelectedParent(element);
      } else if (element instanceof
          Blockly.comments.RenderedWorkspaceComment) {
        return element && element.isDeletable();
      }
      return false;
    },
    callback: function(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();

      const apply = function(element) {
        if (deleteShortcut.check(element)) {
          element.workspace.hideChaff();
          if (element instanceof Blockly.BlockSvg) {
            if (element.outputConnection) {
              element.dispose(false, true);
            } else {
              element.dispose(true, true);
            }
          } else {
            element.dispose();
          }
        }
      };

      const selected = Blockly.common.getSelected();
      Blockly.Events.setGroup(true);
      if (selected && selected.isInMutator) {
        selected.checkAndDelete();
        return true;
      }
      const dragSelection = dragSelectionWeakMap.get(workspace);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        for (const element of selected.subDraggables) {
          selected.removeSubDraggable_(element[0]);
          apply(element[0]);
        }
        dragSelection.clear();
      } else if (!dragSelection.size) {
        apply(selected);
      }

      Blockly.getFocusManager().focusTree(workspace);
      Blockly.Events.setGroup(false);
      return true;
    },
    keyCodes: [Blockly.utils.KeyCodes.DELETE, Blockly.utils.KeyCodes.BACKSPACE],
  };
  if (name in Blockly.ShortcutRegistry.registry.getRegistry()) {
    Blockly.ShortcutRegistry.registry.unregister(name);
  }
  Blockly.ShortcutRegistry.registry.register(deleteShortcut);
};


/**
 * Keyboard shortcut to copy multiple selected blocks on
 * ctrl+c, cmd+c, or alt+c.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerCopy = function(useCopyPasteCrossTab) {
  const name = Blockly.ShortcutItems.names.COPY;
  const copyShortcut = {
    name,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      const dragSelection = dragSelectionWeakMap.get(workspace);
      if (!dragSelection.size) {
        return copyShortcut.check(selected);
      }
      for (const id of dragSelection) {
        const element = getByID(workspace, id);
        if (copyShortcut.check(element)) {
          return true;
        }
      }
      return false;
    },
    check: function(element) {
      if (element instanceof Blockly.BlockSvg) {
        return element && element.isDeletable() && element.isMovable() &&
            !hasSelectedParent(element);
      } else if (element instanceof
          Blockly.comments.RenderedWorkspaceComment) {
        return element && element.isDeletable() && element.isMovable();
      }
      return false;
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or
      // otherwise indicate an error due to the lack of a selection.
      e.preventDefault();
      copyData.clear();
      workspace.hideChaff();
      const blockList = [];
      const apply = function(element) {
        if (copyShortcut.check(element)) {
          copyData.add(JSON.stringify(element.toCopyData()));
          if (element instanceof Blockly.BlockSvg) {
            blockList.push(element.id);
          }
        }
      };
      const selected = Blockly.common.getSelected();
      const dragSelection = dragSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        for (const element of selected.subDraggables) {
          apply(element[0]);
        }
      } else if (!dragSelection.size) {
        apply(selected);
      }

      connectionDBList.length = 0;
      blockList.forEach(function(id) {
        const block = workspace.getBlockById(id);
        const parentBlock = block.getParent();
        if (parentBlock && blockList.indexOf(parentBlock.id) !== -1 &&
            parentBlock.getNextBlock() === block) {
          connectionDBList.push([
            blockList.indexOf(parentBlock.id),
            blockList.indexOf(block.id)]);
        }
      });
      if (useCopyPasteCrossTab) {
        dataCopyToStorage();
      }
      Blockly.Events.setGroup(false);
      return true;
    },
    keyCodes: [Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL_CMD])],
  };
  if (name in Blockly.ShortcutRegistry.registry.getRegistry()) {
    Blockly.ShortcutRegistry.registry.unregister(name);
  }
  Blockly.ShortcutRegistry.registry.register(copyShortcut);
};


/**
 * Keyboard shortcut to copy and delete multiple selected blocks on
 * ctrl+x, cmd+x, or alt+x.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerCut = function(useCopyPasteCrossTab) {
  const name = Blockly.ShortcutItems.names.CUT;
  const cutShortcut = {
    name,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      const dragSelection = dragSelectionWeakMap.get(workspace);
      if (!dragSelection.size) {
        return cutShortcut.check(selected);
      }
      for (const id of dragSelection) {
        const element = getByID(workspace, id);
        if (cutShortcut.check(element)) {
          return true;
        }
      }
      return false;
    },
    check: function(element) {
      if (element instanceof Blockly.BlockSvg) {
        return element && element.isDeletable() && element.isMovable() &&
            !element.workspace.isFlyout &&
            !hasSelectedParent(element);
      } else if (element instanceof
          Blockly.comments.RenderedWorkspaceComment) {
        return element && element.isDeletable() && element.isMovable();
      }
      return false;
    },
    callback: function(workspace) {
      copyData.clear();
      const elementList = [];
      const apply = function(element) {
        if (cutShortcut.check(element)) {
          copyData.add(JSON.stringify(element.toCopyData()));
          elementList.push(element.id);
        }
      };
      const applyDelete = function(element) {
        if (!element) return;
        element.workspace.hideChaff();
        if (element instanceof Blockly.BlockSvg) {
          if (element.outputConnection) {
            element.dispose(false, true);
          } else {
            element.dispose(true, true);
          }
        } else {
          // This may need to be adjusted based on what
          // kinds of draggables are added to blockly
          element.dispose();
        }
      };

      const selected = Blockly.common.getSelected();
      const dragSelection = dragSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        for (const element of selected.subDraggables) {
          apply(element[0]);
          selected.removeSubDraggable_(element[0]);
        }
      } else if (!dragSelection.size) {
        apply(selected);
      }
      dragSelection.clear();

      connectionDBList.length = 0;
      elementList.forEach(function(id) {
        const block = workspace.getBlockById(id);
        if (block) {
          const parentBlock = block.getParent();
          if (parentBlock && elementList.indexOf(parentBlock.id) !== -1 &&
              parentBlock.getNextBlock() === block) {
            connectionDBList.push([
              elementList.indexOf(parentBlock.id),
              elementList.indexOf(block.id)]);
          }
        }
      });
      elementList.forEach(function(id) {
        const element = getByID(workspace, id);
        applyDelete(element);
      });

      if (useCopyPasteCrossTab) {
        dataCopyToStorage();
      }
      Blockly.Events.setGroup(false);
      return true;
    },
    keyCodes: [Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL_CMD])],
  };

  if (name in Blockly.ShortcutRegistry.registry.getRegistry()) {
    Blockly.ShortcutRegistry.registry.unregister(name);
  }
  Blockly.ShortcutRegistry.registry.register(cutShortcut);
};

// TODO: Look into undo stack and adding/removing blocks from multidraggable
/**
 * Keyboard shortcut to paste multiple selected blocks on
 * ctrl+v, cmd+v, or alt+v.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerPaste = function(useCopyPasteCrossTab) {
  const name = Blockly.ShortcutItems.names.PASTE;
  const pasteShortcut = {
    name,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function(workspace) {
      inPasteShortcut.set(workspace, true);
      const dragSelection = dragSelectionWeakMap.get(workspace);
      const multiDraggable = multiDraggableWeakMap.get(workspace);

      // Update the dragSelection and multiDraggable object
      // to remove current selection prior to pasting.
      if (dragSelection.size) {
        dragSelection.forEach(function(id) {
          const element = getByID(workspace, id);
          if (element) {
            element.unselect();
          }
        });
        dragSelection.clear();
        multiDraggable.clearAll_();
      }

      Blockly.Events.setGroup(true);

      const blockList = [];
      if (useCopyPasteCrossTab) {
        dataCopyFromStorage();
      }
      const getPasteBlock = function(data, workspace) {
        const state = data.blockState || data.commentState;
        const {left, top, width, height} =
            workspace.getMetricsManager().getViewMetrics(true);
        const centerCoords = new Blockly.utils.Coordinate(
            left + width / 2, top + height / 2);
        const viewportRect = new Blockly.utils.Rect(
            top, top + height, left, left + width);
        if (viewportRect.contains(state.x, state.y)) {
          return Blockly.clipboard.paste(data, workspace);
        }
        return Blockly.clipboard.paste(data, workspace, centerCoords);
      };
      copyData.forEach(function(stringData) {
        const data = JSON.parse(stringData);
        // Set unique id for data to prevent bug where
        // blocks on multiple workspaces are highlighted.
        if (workspace.id !== Blockly.getMainWorkspace().id) {
          if (data.blockState) {
            data.blockState.id = Blockly.utils.idGenerator.genUid();
          } else if (data.commentState) {
            data.commentState.id = Blockly.utils.idGenerator.genUid();
          }
        }

        if (data.source) {
          workspace = data.source;
        }
        if (workspace.isFlyout) {
          workspace = workspace.targetWorkspace;
        }
        if (data.typeCounts &&
            workspace.isCapacityAvailable(data.typeCounts)) {
          const element = getPasteBlock(data, workspace);
          if (element) {
            blockList.push(element);
          }
          if (element.type !== 'drag_to_dupe') {
            dragSelectionWeakMap.get(workspace).add(element.id);
            multiDraggableWeakMap.get(workspace).addSubDraggable_(element);
          }
        } else if (data.commentState) {
          const element = getPasteBlock(data, workspace);
          if (element) {
            element.select();
          }
          dragSelectionWeakMap.get(workspace).add(element.id);
          multiDraggableWeakMap.get(workspace).addSubDraggable_(element);
        }
      });
      connectionDBList.forEach(function(connectionDB) {
        blockList[connectionDB[0]].nextConnection.connect(
            blockList[connectionDB[1]].previousConnection);
      });

      Blockly.Events.setGroup(false);
      Blockly.renderManagement.finishQueuedRenders().then(() => {
        if (dragSelection.size === 1) {
          Blockly.common.setSelected(getByID(workspace, dragSelection.values().next().value));
        } else {
          Blockly.common.setSelected(multiDraggable);
        }
      });
      return true;
    },
    keyCodes: [Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL_CMD])],
  };

  if (name in Blockly.ShortcutRegistry.registry.getRegistry()) {
    Blockly.ShortcutRegistry.registry.unregister(name);
  }
  Blockly.ShortcutRegistry.registry.register(pasteShortcut);
};

/**
 * Keyboard shortcut to select all top blocks in the workspace on
 * ctrl+a, cmd+a, or alt+a.
 */
const registerSelectAll = function() {
  const name = 'selectall';
  const selectAllShortcut = {
    name,
    preconditionFn: function(workspace) {
      return workspace.getTopBlocks().some(
          (b) => selectAllShortcut.check(b)) ? true : false;
    },
    check: function(block) {
      return block &&
            (block.isDeletable() || block.isMovable()) &&
            !block.isInsertionMarker();
    },
    callback: function(workspace, e) {
      // Prevent the default text all selection behavior.
      e.preventDefault();
      const dragSelection = dragSelectionWeakMap.get(workspace);
      const multiDraggable = multiDraggableWeakMap.get(workspace);

      // Make sure that there is nothing in the multiDraggable
      // (clearing) prior to selecting all blocks in workspace.
      if (Blockly.getSelected()) {
        if (Blockly.getSelected() instanceof MultiselectDraggable) {
          for (const [subDraggable] of Blockly.getSelected().subDraggables) {
            subDraggable.unselect();
          }
        } else {
          Blockly.getSelected().unselect();
        }
        Blockly.getFocusManager().focusTree(workspace);
        multiDraggable.clearAll_();
        dragSelectionWeakMap.get(workspace).clear();
      }

      const blockList = [];
      workspace.getTopBlocks().forEach(function(block) {
        if (selectAllShortcut.check(block)) {
          blockList.push(block);
          let nextBlock = block.getNextBlock();
          while (nextBlock) {
            blockList.push(nextBlock);
            nextBlock = nextBlock.getNextBlock();
          }
        }
      });
      blockList.forEach(function(block) {
        if (block.type !== 'drag_to_dupe') {
          multiDraggable.addSubDraggable_(block);
          dragSelection.add(block.id);
        }
      });

      Blockly.common.setSelected(multiDraggable);
      return true;
    },
  };
  if (name in Blockly.ShortcutRegistry.registry.getRegistry()) {
    Blockly.ShortcutRegistry.registry.unregister(name);
  }
  Blockly.ShortcutRegistry.registry.register(selectAllShortcut);

  const ctrlA = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.CTRL_CMD]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlA, selectAllShortcut.name);

};

/**
 * Unregister keyboard shortcut item, should be called before registering.
 */
export const unregisterOrigShortcut = function() {
  registeredShortcut.length = 0;
  for (const name of [Blockly.ShortcutItems.names.DELETE,
    Blockly.ShortcutItems.names.COPY,
    Blockly.ShortcutItems.names.CUT, Blockly.ShortcutItems.names.PASTE]) {
    if (Object.entries(Blockly.ShortcutRegistry.registry.getRegistry())
        .map(([_, value]) => value.name).includes(name)) {
      Blockly.ShortcutRegistry.registry.unregister(name);
      registeredShortcut.push(name);
    }
  }
};

export const unregisterOurShortcut = function() {
  registeredShortcut.length = 0;
  for (const name of [Blockly.ShortcutItems.names.DELETE,
    Blockly.ShortcutItems.names.COPY,
    Blockly.ShortcutItems.names.CUT, Blockly.ShortcutItems.names.PASTE]) {
    if (Object.entries(Blockly.ShortcutRegistry.registry.getRegistry())
        .map(([_, value]) => value.name).includes(name)) {
      Blockly.ShortcutRegistry.registry.unregister(name);
    }
    registeredShortcut.push(name);
  }
};

/**
 * Register default keyboard shortcut item.
 */
export const registerOrigShortcut = function() {
  const map = {
    [Blockly.ShortcutItems.names.DELETE]: Blockly.ShortcutItems.registerDelete,
    [Blockly.ShortcutItems.names.COPY]: Blockly.ShortcutItems.registerCopy,
    [Blockly.ShortcutItems.names.CUT]: Blockly.ShortcutItems.registerCut,
    [Blockly.ShortcutItems.names.PASTE]: Blockly.ShortcutItems.registerPaste,
  };
  for (const name of registeredShortcut) {
    map[name]();
  }
};

/**
 * Registers all modified keyboard shortcut item.
 * @param {boolean} useCopyPasteCrossTab Whether to use copy/paste cross tab.
 */
export const registerOurShortcut = function(useCopyPasteCrossTab) {
  const ListNoParameter = [Blockly.ShortcutItems.names.DELETE];
  const map = {
    [Blockly.ShortcutItems.names.DELETE]: registerShortcutDelete,
    [Blockly.ShortcutItems.names.COPY]: registerCopy,
    [Blockly.ShortcutItems.names.CUT]: registerCut,
    [Blockly.ShortcutItems.names.PASTE]: registerPaste,
  };
  for (const name of registeredShortcut) {
    if (ListNoParameter.includes(name)) {
      map[name]();
    } else {
      map[name](useCopyPasteCrossTab);
    }
  }
  registerSelectAll();
};
