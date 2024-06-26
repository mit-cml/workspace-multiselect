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
  blockSelectionWeakMap, hasSelectedParent, copyData, connectionDBList,
  dataCopyToStorage, dataCopyFromStorage, registeredShortcut, multiDraggableWeakMap
} from './global';
import {MultiselectDraggable} from "./multiselect_draggable";

/**
 * Modification for keyboard shortcut 'Delete' to be available
 * for multiple blocks.
 */
const registerShortcutDelete = function() {
  const deleteShortcut = {
    name: Blockly.ShortcutItems.names.DELETE,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      if (!blockSelection.size) {
        return deleteShortcut.check(selected);
      }
      for (const id of blockSelection) {
        const block = workspace.getBlockById(id);
        if (deleteShortcut.check(block)) {
          return true;
        }
      }
      return false;
    },
    check: function(block) {
      return block && block.isDeletable() &&
          !block.workspace.isFlyout &&
          !hasSelectedParent(block);
    },
    callback: function(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();

      const apply = function(block) {
        if (deleteShortcut.check(block)) {
          block.workspace.hideChaff();
          if (block.outputConnection) {
            block.dispose(false, true);
          } else {
            block.dispose(true, true);
          }
        }
      };

      const selected = Blockly.common.getSelected();
      Blockly.Events.setGroup(true);
      const blockSelection = blockSelectionWeakMap.get(workspace);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        console.log("DELETE KEY PRESSED")
        for (const element of selected.subDraggables) {
          selected.removeSubDraggable(element[0])
          apply(element[0])
        }
      } else if (!blockSelection.size) {
        apply(selected);
      } else {
        blockSelection.forEach(function(id) {
          const block = workspace.getBlockById(id);
          apply(block);
        });
      };

      Blockly.Events.setGroup(false);
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(deleteShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.DELETE, deleteShortcut.name);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.BACKSPACE, deleteShortcut.name);
};


/**
 * Keyboard shortcut to copy multiple selected blocks on
 * ctrl+c, cmd+c, or alt+c.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerCopy = function(useCopyPasteCrossTab) {
  const copyShortcut = {
    name: Blockly.ShortcutItems.names.COPY,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      if (!blockSelection.size) {
        return copyShortcut.check(selected);
      }
      for (const id of blockSelection) {
        const block = workspace.getBlockById(id);
        if (copyShortcut.check(block)) {
          return true;
        }
      }
      return false;
    },
    check: function(block) {
      return block && block.isDeletable() && block.isMovable() &&
          !hasSelectedParent(block);
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or
      // otherwise indicate an error due to the lack of a selection.
      e.preventDefault();
      copyData.clear();
      workspace.hideChaff();
      const blockList = [];
      const apply = function(block) {
        if (copyShortcut.check(block)) {
          copyData.add(JSON.stringify(block.toCopyData()));
          blockList.push(block.id);
        }
      };
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        console.log("COPY KEY PRESSED")
        for (const element of selected.subDraggables) {
          apply(element[0]);
        }
      } else if (!blockSelection.size) {
        apply(selected);
      } else {
        blockSelection.forEach(function(id) {
          const block = workspace.getBlockById(id);
          apply(block);
        });
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
  };
  Blockly.ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlC, Blockly.ShortcutItems.names.COPY);

  const altC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      altC, Blockly.ShortcutItems.names.COPY);

  const metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      metaC, Blockly.ShortcutItems.names.COPY);
};


/**
 * Keyboard shortcut to copy and delete multiple selected blocks on
 * ctrl+x, cmd+x, or alt+x.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerCut = function(useCopyPasteCrossTab) {
  const cutShortcut = {
    name: Blockly.ShortcutItems.names.CUT,
    preconditionFn: function(workspace) {
      if (workspace.options.readOnly || Blockly.Gesture.inProgress()) {
        return false;
      }
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      if (!blockSelection.size) {
        return cutShortcut.check(selected);
      }
      for (const id of blockSelection) {
        const block = workspace.getBlockById(id);
        if (cutShortcut.check(block)) {
          return true;
        }
      }
      return false;
    },
    check: function(block) {
      return block && block.isDeletable() && block.isMovable() &&
          !block.workspace.isFlyout &&
          !hasSelectedParent(block);
    },
    callback: function(workspace) {
      copyData.clear();
      const blockList = [];
      const apply = function(block) {
        if (cutShortcut.check(block)) {
          copyData.add(JSON.stringify(block.toCopyData()));
          blockList.push(block.id);
        }
      };
      const applyDelete = function(block) {
        if (!block) return;
        block.workspace.hideChaff();
        if (block.outputConnection) {
          block.dispose(false, true);
        } else {
          block.dispose(true, true);
        }
      };
      connectionDBList.length = 0;
      const applyConn = function(block) {
        const parentBlock = block.getParent();
        if (parentBlock && blockList.indexOf(parentBlock.id) !== -1 &&
            parentBlock.getNextBlock() === block) {
          connectionDBList.push([
            blockList.indexOf(parentBlock.id),
            blockList.indexOf(block.id)]);
        }
      }

      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);

      // Handle the case where MultiselectDraggable is in use
      if (selected && selected instanceof MultiselectDraggable) {
        for (const element of selected.subDraggables) {
          apply(element[0]);
          applyConn(element[0])
        }
        for (const element of selected.subDraggables) {
          selected.removeSubDraggable(element[0]);
          applyDelete(element[0]);
        }
      } else if (!blockSelection.size) {
        apply(selected);
        applyConn(selected);
        applyDelete(selected);
      } else {
        blockSelection.forEach(function(id) {
          const block = workspace.getBlockById(id);
          apply(block);
          applyConn(block);
          applyDelete(block);
        });
      }

      if (useCopyPasteCrossTab) {
        dataCopyToStorage();
      }
      Blockly.Events.setGroup(false);
      return true;
    },
  };

  Blockly.ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  const altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};

/**
 * Keyboard shortcut to paste multiple selected blocks on
 * ctrl+v, cmd+v, or alt+v.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
const registerPaste = function(useCopyPasteCrossTab) {
  const pasteShortcut = {
    name: Blockly.ShortcutItems.names.PASTE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function(workspace) {
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);
      const multiDraggable = multiDraggableWeakMap.get(workspace);

      if (blockSelection.size) {
        blockSelection.forEach(function(id) {
          const block = workspace.getBlockById(id);
          if (block) {
            block.pathObject.updateSelected(false);
            multiDraggable.removeSubDraggable(block)
          }
        });
        blockSelection.clear();
      }

      const blockList = [];
      if (useCopyPasteCrossTab) {
        dataCopyFromStorage();
      }
      copyData.forEach(function(stringData) {
        const data = JSON.parse(stringData);
        let targetWorkspace = workspace;

        // Set unique id for data
        data.blockState.id = Blockly.utils.idGenerator.genUid();

        if (data.source) {
          targetWorkspace = data.source;
        }
        if (targetWorkspace.isFlyout) {
          targetWorkspace = targetWorkspace.targetWorkspace;
        }
        if (data.typeCounts &&
            targetWorkspace.isCapacityAvailable(data.typeCounts)) {
          const block = Blockly.clipboard.paste(data, targetWorkspace);
          blockList.push(block);
          block.pathObject.updateSelected(true);
          blockSelectionWeakMap.get(block.workspace).add(block.id);
          multiDraggableWeakMap.get(workspace).addSubDraggable(block);
        }
      });
      connectionDBList.forEach(function(connectionDB) {
        blockList[connectionDB[0]].nextConnection.connect(
            blockList[connectionDB[1]].previousConnection);
      });
      Blockly.Events.setGroup(false);
      Blockly.common.setSelected(multiDraggable);
      return true;
    },
  };

  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
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
      const blockSelection = blockSelectionWeakMap.get(workspace);
      const multiDraggable = multiDraggableWeakMap.get(workspace);
      if (Blockly.getSelected()) {
          Blockly.getSelected().pathObject.updateSelected(false);
          Blockly.common.setSelected(null);
          multiDraggable.clearAll();
      }
      const blockList = [];
      workspace.getAllBlocks().forEach(function(block) {
        if (selectAllShortcut.check(block)) {
          blockList.push(block);
        }
      });
      blockList.forEach(function(block) {
          blockSelection.add(block.id);
          block.pathObject.updateSelected(true);
          multiDraggable.addSubDraggable(block);
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
      Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlA, selectAllShortcut.name);

  const altA =
  Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      altA, selectAllShortcut.name);

  const metaA = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      metaA, selectAllShortcut.name);
};

/**
 * Unregister keyboard shortcut item, should be called before registering.
 */
export const unregisterShortcut = function() {
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
