/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Global data structure.
 */

import * as Blockly from 'blockly/core';
import { MultiselectDraggable } from './multiselect_draggable';

/**
 * Weakmap for storing multidraggable objects for a given workspace (as a key).
 */
export const multiDraggableWeakMap = new WeakMap();

/**
 * Set for storing the current selected blockSvg ids.
 */
export const dragSelectionWeakMap = new WeakMap();

/**
 * Store the current selection mode.
 */
export const inMultipleSelectionModeWeakMap = new WeakMap();

/**
 * Store the multi-select controls instances.
 */
export const multiselectControlsList = new Set();

/**
 * Store the copy data.
 */
export const copyData = new Set();

/**
 * Store the paste shortcut mode.
 */
export const inPasteShortcut = new WeakMap();

/**
 * Store the copied connections list.
 */
export const connectionDBList = [];

/**
 * Store the registered context menu list.
 */
export const registeredContextMenu = [];

/**
 * Store the registered shortcut list.
 */
export const registeredShortcut = [];

/**
 * Store the copy time.
 */
let timestamp = 0;

/**
 * Store the id of mutator workspace which elements were copied from.
 * `null` if nothing is copied or if elements were not copied from mutator workspace
 */
let copyMutatorId = null;

// TODO: Update custom enum below into actual enum
//  if plugin is updated to TypeScript.
/**
 * Object holding the names of the default shortcut items.
 */
export const shortcutNames = Object.freeze({
  MULTIDELETE: 'multiselectDelete',
  MULTICOPY: 'multiselectCopy',
  MULTICUT: 'multiselectCut',
  MULTIPASTE: 'multiselectPaste',
});

/**
 * Check if the current selected blockSvg set already contains the parents.
 * @param {!Blockly.BlockSvg} block to check.
 * @param {boolean} move Whether or not in moving.
 * @returns {boolean} true if the block's parents are selected.
 */
export const hasSelectedParent = function(block, move = false) {
  while (block) {
    if (move) {
      block = block.getParent();
    } else {
      block = block.getSurroundParent();
    }

    if (block && dragSelectionWeakMap.get(block.workspace).has(block.id)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the corresponding object related to the id in the workspace.
 * Currently only supports blocks and workspace comments
 * @param {!Blockly.Workspace} workspace to check.
 * @param {string} id The ID of the object
 * @returns {Blockly.IDraggable} The object that is draggable
 */
export const getByID = function(workspace, id) {
  // TODO: Need to figure our if there is a way to determine
  // type of draggable just from ID, or if we have to pass into
  // getById functions for each type
  if (workspace.getBlockById(id)) {
    return workspace.getBlockById(id);
  } else if (workspace.getCommentById(id)) {
    return workspace.getCommentById(id);
  }
  return null;
};

/**
 * Store copy information for blocks in localStorage.
 */
export const dataCopyToStorage = function() {
  if (copyMutatorId) {
    localStorage.removeItem('blocklyStashMulti')
    return;
  }
  const storage = [];
  copyData.forEach((data) => {
    delete data['source'];
    storage.push(data);
  });
  timestamp = Date.now();
  localStorage.setItem('blocklyStashMulti', JSON.stringify(storage));
  localStorage.setItem('blocklyStashConnection',
      JSON.stringify(connectionDBList));
  localStorage.setItem('blocklyStashTime', timestamp);
};

/**
 * Get copy information for blocks from localStorage.
 */
export const dataCopyFromStorage = function() {
  const storage = JSON.parse(localStorage.getItem('blocklyStashMulti'));
  const connection = JSON.parse(localStorage.getItem('blocklyStashConnection'));
  const time = localStorage.getItem('blocklyStashTime');
  if (storage && parseInt(time) > timestamp) {
    timestamp = time;
    copyData.clear();
    storage.forEach((data) => {
      copyData.add(data);
    });
    connectionDBList.length = 0;
    connection.forEach((data) => {
      connectionDBList.push(data);
    });
  }
};

/**
 * Get blocks number in the clipboard from localStorage.
 * @param {boolean} useCopyPasteCrossTab Whether or not to use
 *     cross tab copy/paste.
 * @returns {number} The number of blocks in the clipboard.
 */
export const blockNumGetFromStorage = function(useCopyPasteCrossTab) {
  if (!useCopyPasteCrossTab) {
    return copyData.size;
  }
  const storage = JSON.parse(localStorage.getItem('blocklyStashMulti'));
  const time = localStorage.getItem('blocklyStashTime');
  if (storage && parseInt(time) > timestamp) {
    return storage.length;
  }
  return copyData.size;
};

/**
 * Check whether element can be copied
 */
export const copyCheckCallback = (element) => {
  if (element instanceof Blockly.BlockSvg) {
    return element && element.isDeletable() && element.isMovable() &&
        (element.isInMutator || !hasSelectedParent(element));
  } else if (element instanceof
      Blockly.comments.RenderedWorkspaceComment) {
    return element && element.isDeletable() && element.isMovable();
  }
  return false;
};

/**
 * Copy selected elements
 * 
 * @param {boolean} workspace Workspace this action was triggered on
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
export const copyCallback = (workspace, useCopyPasteCrossTab) => {
  copyData.clear();
  workspace.hideChaff();
  copyMutatorId = null;
  const blockList = [];
  const apply = function(element) {
    if (copyCheckCallback(element)) {
      copyData.add(JSON.stringify(element.toCopyData()));
      if (element instanceof Blockly.BlockSvg) {
        blockList.push(element.id);
        if (element.isInMutator) {
          copyMutatorId = element.workspace.id;
        }
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
  } else {
    apply(selected);
  }

  connectionDBList.length = 0;
  blockList.forEach(function(id) {
    const block = workspace.getBlockById(id);
    const parentBlock = block?.getParent();
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
};

/**
 * Cut selected elements
 * 
 * @param {boolean} workspace Workspace this action was triggered on
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
export const cutCallback = (workspace, useCopyPasteCrossTab) => {
  copyData.clear();
  const elementList = [];
  const apply = function(element) {
    if (copyCheckCallback(element)) {
      copyData.add(JSON.stringify(element.toCopyData()));
      elementList.push(element.id);
      if (element.isInMutator) {
        copyMutatorId = element.workspace.id;
      }
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
    dragSelection.clear();
  } else {
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
  Blockly.common.setSelected(null);
  Blockly.Events.setGroup(false);
};

/**
 * Paste selected elements
 * 
 * @param {boolean} workspace Workspace this action was triggered on
 * @param {boolean} useCopyPasteCrossTab Whether or not to use copy/paste
 */
export const pasteCallback = (workspace, useCopyPasteCrossTab) => {
  if (workspace.isMutator && workspace.id !== copyMutatorId) {
    return;
  }

  inPasteShortcut.set(workspace, true);
  const dragSelection = dragSelectionWeakMap.get(workspace);
  const multiDraggable = multiDraggableWeakMap.get(workspace);

  // Update the dragSelection and multiDraggable object
  // to remove current selection prior to pasting.
  if (dragSelection?.size) {
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
    if (copyMutatorId) {
      workspace = Blockly.common.getWorkspaceById(copyMutatorId);
    }
    if (!workspace) {
      return;
    }
    if (data.typeCounts &&
        workspace.isCapacityAvailable(data.typeCounts)) {
      const element = getPasteBlock(data, workspace);
      if (element) {
        blockList.push(element);
      }
      if (element.type !== 'drag_to_dupe' && !copyMutatorId) {
        dragSelectionWeakMap.get(workspace).add(element.id);
        multiDraggableWeakMap.get(workspace).addSubDraggable_(element);
      }
    } else if (data.commentState) {
      const element = getPasteBlock(data, workspace);
      if (element) {
        element.select();
      }
      if (!copyMutatorId) {
        dragSelectionWeakMap.get(workspace).add(element.id);
        multiDraggableWeakMap.get(workspace).addSubDraggable_(element);
      }
    }
  });
  connectionDBList.forEach(function(connectionDB) {
    blockList[connectionDB[0]].nextConnection.connect(
        blockList[connectionDB[1]].previousConnection);
  });

  if (!copyMutatorId) {
    if (dragSelection.size === 1) {
      Blockly.common.setSelected(getByID(workspace, dragSelection.values().next().value));
    } else {
      Blockly.common.setSelected(multiDraggable);
    }
  }
  
  Blockly.Events.setGroup(false);
};