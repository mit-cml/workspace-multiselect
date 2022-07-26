/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection shortcut.
 */

import * as Blockly from 'blockly/core';
import {blockSelectionWeakMap, hasSelectedParent} from './global';

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
      if (!blockSelection.size) {
        apply(selected);
      }
      blockSelection.forEach(function(id) {
        const block = workspace.getBlockById(id);
        apply(block);
      });
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

const copyData = new Set();

/**
 * Keyboard shortcut to copy multiple selected blocks on
 * ctrl+c, cmd+c, or alt+c.
 */
const registerCopy = function() {
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
      const apply = function(block) {
        if (copyShortcut.check(block)) {
          copyData.add(block.toCopyData());
        }
      };
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(selected);
      }
      blockSelection.forEach(function(id) {
        const block = workspace.getBlockById(id);
        apply(block);
      });
      Blockly.Events.setGroup(false);
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlC, Blockly.ShortcutItems.names.COPY);

  const altC =
  Blockly.ShortcutRegistry.registry.createSerializedKey(
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
 */
const registerCut = function() {
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
      const apply = function(block) {
        if (cutShortcut.check(block)) {
          copyData.add(block.toCopyData());
          block.workspace.hideChaff();
          if (block.outputConnection) {
            block.dispose(false, true);
          } else {
            block.dispose(true, true);
          }
        }
      };
      const selected = Blockly.common.getSelected();
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);
      if (!blockSelection.size) {
        apply(selected);
      }
      blockSelection.forEach(function(id) {
        const block = workspace.getBlockById(id);
        apply(block);
      });
      Blockly.Events.setGroup(false);
      return true;
    },
  };

  Blockly.ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  const altX =
  Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};

/**
 * Keyboard shortcut to paste multiple selected blocks on
 * ctrl+v, cmd+v, or alt+v.
 */
const registerPaste = function() {
  const pasteShortcut = {
    name: Blockly.ShortcutItems.names.PASTE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function(workspace) {
      const blockSelection = blockSelectionWeakMap.get(workspace);
      Blockly.Events.setGroup(true);
      blockSelection.forEach(function(id) {
        const block = workspace.getBlockById(id);
        if (block) {
          block.pathObject.updateSelected(false);
        }
      });
      blockSelection.clear();
      copyData.forEach(function(data) {
        // Pasting always pastes to the main workspace, even if the copy
        // started in a flyout workspace.
        let workspace = data.source;
        if (workspace.isFlyout) {
          workspace = workspace.targetWorkspace;
        }
        if (data.typeCounts &&
            workspace.isCapacityAvailable(data.typeCounts)) {
          const block = workspace.paste(data.saveInfo);
          block.pathObject.updateSelected(true);
          blockSelectionWeakMap.get(block.workspace).add(block.id);
        }
      });
      Blockly.Events.setGroup(false);
      return true;
    },
  };

  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV =
  Blockly.ShortcutRegistry.registry.createSerializedKey(
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
const registeSelectAll = function() {
  const selectAllShortcut = {
    name: 'selectall',
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
      if (Blockly.selected && !blockSelection.has(Blockly.selected.id)) {
        Blockly.selected.pathObject.updateSelected(false);
        Blockly.common.setSelected(null);
      }
      workspace.getTopBlocks().forEach(function(block) {
        if (selectAllShortcut.check(block)) {
          blockSelection.add(block.id);
          if (!Blockly.common.getSelected()) {
            Blockly.common.setSelected(block);
          }
          block.pathObject.updateSelected(true);
        }
      });
      return true;
    },
  };
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
  Blockly.ShortcutRegistry.registry.unregister(
      Blockly.ShortcutItems.names.DELETE);
  Blockly.ShortcutRegistry.registry.unregister(
      Blockly.ShortcutItems.names.COPY);
  Blockly.ShortcutRegistry.registry.unregister(
      Blockly.ShortcutItems.names.CUT);
  Blockly.ShortcutRegistry.registry.unregister(
      Blockly.ShortcutItems.names.PASTE);
};

/**
 * Register default keyboard shortcut item.
 */
export const registerOrigShortcut = function() {
  Blockly.ShortcutItems.registerDelete();
  Blockly.ShortcutItems.registerCopy();
  Blockly.ShortcutItems.registerCut();
  Blockly.ShortcutItems.registerPaste();
};

/**
 * Registers all modified keyboard shortcut item.
 */
export const registerOurShortcut = function() {
  registerShortcutDelete();
  registerCopy();
  registerCut();
  registerPaste();
  registeSelectAll();
};
