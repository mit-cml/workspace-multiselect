/**
 * @license
 * Copyright 2024 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection draggable class.
 */

import * as Blockly from 'blockly/core';

/**
 * A draggable object that adds the functionality for multiple blocks to
 * be moved while someone is dragging it. It implements the IDraggable interface in Blockly v11.
 */
export class MultiselectDraggable implements Blockly.IDraggable {
    private subDraggables: Blockly.IDraggable[];

    // TODO: Need to determine what is needed in constructor
    constructor(workspace) {
        this.workspace_ = workspace;

    }

    // TODO: Need to determine how to implement this after talking to mentor
    addSubDraggable(subBlock: Blockly.IDraggable) {
        this.subDraggables.push(subBlock)
    }

    // TODO: Need to determine if blocks will always be movable
    isMovable() {
        return true;
    }

    // TODO: Need to determine whether these are needed

    // getRelativeToSurfaceXY(): Coordinate {
    //     return this.loc;
    // }

    // dispose() {
    //
    // }

    // revertDrag() {
    // }


    // TODO: Need to implement startDrag
    startDrag(e: PointerEvent) {
      for (const draggable of this.subDraggables) {
        draggable.startDrag(e);
      }
    }

    // TODO: Need to implement drag
    drag(newLoc: Coordinate, target: IDragTarget, e?: PointerEvent) {
      for (const draggable of this.subDraggables) {
        draggable.drag(Blockly.Coordinate.sum(newLoc, draggable.dragOffset), target, e);
      }
    }

    // TODO: Need to implement endDrag
    endDrag(e: PointerEvent) {
      for (const draggable of this.subDraggables) {
        draggable.endDrag(e);
      }
    }


  }

Blockly.registry.register(Blockly.registry.Type.MULTI_DRAGGABLE,
    'MultiselectDraggable', MultiselectDraggable);