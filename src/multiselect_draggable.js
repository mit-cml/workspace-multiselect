/**
 * @license
 * Copyright 2024 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection draggable class.
 */
import * as Blockly from 'blockly/core';
import {inMultipleSelectionModeWeakMap} from "./global";


/**
 * A draggable object that adds the functionality for multiple blocks to
 * be moved while someone is dragging it. It implements the IDraggable interface in Blockly v11.
 */
export class MultiselectDraggable {

    // TODO: Need to determine what is needed in constructor
    constructor(workspace) {
        this.workspace = workspace;
        this.id = Blockly.utils.idGenerator.genUid();
        this.subDraggables = new Map();
        this.loc = new Blockly.utils.Coordinate(0,0);
    }

    // TODO: Need to determine how to implement this after talking to mentor
    addSubDraggable(subDraggable) {
        this.subDraggables.set(subDraggable, subDraggable.getRelativeToSurfaceXY())
        console.log("Block added!!!");
        console.log(subDraggable.getRelativeToSurfaceXY())
        this.addPointerDownEventListener(subDraggable);
        // this.loc = subDraggable.getRelativeToSurfaceXY();
        // console.log("subdraggables set", this.subDraggables);
    }

    removeSubDraggable(subDraggable) {
        this.subDraggables.delete(subDraggable);
        // console.log("Block removed!!!");
        this.removePointerDownEventListener(subDraggable);
    }

    // This is the feature where we added a pointer down event listener.
    // This was added to mitigate the issue of setStartBlock overwriting the
    // call that passes the multidraggable to Blockly.common.SetSelected().
    // This should be updated/fixed when a more flexible gesture handling system is implemented.
    addPointerDownEventListener(subDraggable) {
        // Bind the handler to the correct context (class instance)
        // i.e. it creates a new function where the 'this' of the new function
        // is set to whatever is passed into the bind method argument.
        // In this case, it is the multiselectDraggable class/object.
        const handler = this.pointerDownEventHandler.bind(this);
        // Store the handler function in the subDraggable object
        subDraggable.pointerDownHandler = handler;
        // When adding/removing an event listener, we must pass in named functions
        // as anonymous functions are different function instances in memory
        subDraggable.getSvgRoot().addEventListener('pointerdown', handler);
    }

    removePointerDownEventListener(subDraggable) {
        // Retrieve the stored handler function
        const handler = subDraggable.pointerDownHandler;
        if (handler) {
            subDraggable.getSvgRoot().removeEventListener('pointerdown', handler);
            // Clean up the stored handler reference
            delete subDraggable.pointerDownHandler;
        }
    }

    pointerDownEventHandler(event) {
        console.log('Pointer down event detected');
        Blockly.common.setSelected(this);
    }

    // TODO: Need to determine if blocks will always be movable
    isMovable() {
        return true;
    }

    // TODO: Complete these methods

    /**
     * Returns the current location of the multiselect-draggable in workspace coordinates.
     * @returns {Coordinate} The coordinate of the current location on workspace (top left corner of multiselect-draggable)
     */
    getRelativeToSurfaceXY() {
        return this.loc;
    }


    startDrag(e) {
        console.log("startingDrag, multidrag coords: ", this.loc)
      for (const draggable of this.subDraggables) {
        this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY())
        draggable[0].startDrag()
        console.log("startingDrag of subdraggables")

      }
    }

    drag(newLoc, e) {
        console.log("drag -> newLoc coords", newLoc)
      for (const draggable of this.subDraggables) {
          console.log(draggable)
          draggable[0].drag(Blockly.utils.Coordinate.sum(newLoc,this.subDraggables.get(draggable[0])), e);
          // draggable[0].drag((newLoc), e);
          // this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY())
      }
    }

    endDrag(e) {
        console.log("endDrag")
      for (const draggable of this.subDraggables) {
        draggable[0].endDrag(e);
        // console.log("Before new set", draggable)
        draggable[1] = draggable[0].getRelativeToSurfaceXY();
        // this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY())
        // console.log("After new set", draggable)
        console.log("connected", draggable[0].isConnected)
      }
    }

    updateSubDraggablePositions() {
        for (const draggable of this.subDraggables) {
            draggable[1] = draggable[0].getRelativeToSurfaceXY();
        }
    }

    // TODO: Need to implement revertDrag
    revertDrag() {

    }

    // BELOW ARE OTHER INTERFACES THAT MAY NEED TO BE IMPLEMENTED
    // ==========================================================
    // ==========================================================
    // ==========================================================
    // ==========================================================
    // TODO: Determine if need to implement ISelectable interface
    select() {

    }

    unselect() {

    }


    // TODO: Determine if need to implement IDeletable interface

    isDeletable() {
        return true;
    }

    dispose() {

    }

    setDeleteStyle() {
        // Visually indicate that the draggable is about to be deleted.
    }

    // TODO: Determine if need to implement ICopyable interface

    /**
     * Handle a pointer-down on the workspace for a multidraggable.
     * @param {PointerEvent} e The pointer-down event.
     * @private
     */
    onMouseDown_(e) {
        console.log("onmousedown")
        if (e) {
            Blockly.common.setSelected()
        }
    }


  }
