/**
 * @license
 * Copyright 2024 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection draggable class.
 */
import * as Blockly from 'blockly/core';
import {hasSelectedParent, inMultipleSelectionModeWeakMap} from "./global";


/**
 * A draggable object that adds the functionality for multiple blocks to
 * be moved while someone is dragging it. It implements the IDraggable interface in Blockly v11.
 */
export class MultiselectDraggable {
    constructor(workspace) {
        this.workspace = workspace;
        this.id = Blockly.utils.idGenerator.genUid();
        this.subDraggables = new Map();
        this.topSubDraggables = [];
        this.loc = new Blockly.utils.Coordinate(0,0);
        this.connectionDBList = [];
    }

    /**
     * Clears everything in the subDraggables map of the MultiselectDraggable object.
     */
    clearAll() {
        for (const subDraggable in this.subDraggables) {
            this.removeSubDraggable(subDraggable);
        }
    }

    /**
     * Adds a subDraggable to the multiselectDraggable object
     * @param subDraggable A draggable object that is to be added to the multiselectDraggable object
     */
    addSubDraggable(subDraggable) {
        this.subDraggables.set(subDraggable, subDraggable.getRelativeToSurfaceXY())
        this.addPointerDownEventListener(subDraggable);
    }

    /**
     * Removes a subDraggable to the multiselectDraggable object
     * @param subDraggable A draggable object that is to be removed from the multiselectDraggable object
     */
    removeSubDraggable(subDraggable) {
        this.subDraggables.delete(subDraggable);
        this.removePointerDownEventListener(subDraggable);
    }

    // This is the feature where we added a pointer down event listener.
    // This was added to mitigate the issue of setStartBlock overwriting the
    // call that passes the multidraggable to Blockly.common.SetSelected().
    // This should be updated/fixed when a more flexible gesture handling system is implemented.
    /**
     * Adds a pointer down event listener to a subdraggable to mitigate issue of setStartBlock overwriting
     * the call that passes the multidraggable to Blockly.common.SetSelected()
     * @param subDraggable A draggable object that will have an event listener added to
     */
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

    /**
     * Removes a pointer down event listener from a subdraggable to mitigate issue of setStartBlock overwriting
     * the call that passes the multidraggable to Blockly.common.SetSelected()
     * @param subDraggable A draggable object that will have an event listener removed from
     */
    removePointerDownEventListener(subDraggable) {
        if (subDraggable){
            // Retrieve the stored handler function
            const handler = subDraggable.pointerDownHandler;
            if (handler) {
                subDraggable.getSvgRoot().removeEventListener('pointerdown', handler);

                // Clean up the stored handler reference
                delete subDraggable.pointerDownHandler;
            }
        }
    }

    /**
     * The handler for the pointer down event that mitigates the issue of setStartBlock overwriting
     * the call that passes the multidraggable to Blockly.common.SetSelected()
     * @param event A pointer down event
     */
    pointerDownEventHandler(event) {
        Blockly.common.setSelected(this);
    }

    /**
     * A method that determines whether the object is movable or not.
     * @return {boolean}
     */
    isMovable() {
        return true;
    }

    /**
     * Returns the current location of the multiselectDraggable in workspace coordinates.
     * @returns {Coordinate} The coordinate of the current location on workspace (top left corner of multiselect-draggable)
     */
    getRelativeToSurfaceXY() {
        return this.loc;
    }

    /**
     * Starts a drag on the multiselectDraggable object if there are no other plugins that overwrite this method.
     * It delegates the startDrag methods to the topmost subdraggables.
     * @param e A drag event
     */
    startDrag(e) {
        this.topSubDraggables = [];
      for (const draggable of this.subDraggables) {
          // Save only the topmost subdraggables to do the drag on
          if (!(hasSelectedParent(draggable[0], true))) {
              this.topSubDraggables.push(draggable[0]);
          }

          // Save any connections between blocks of the same level (next statement)
          const parentBlock = draggable[0].getParent();
          if (parentBlock && this.subDraggables.has(parentBlock) && parentBlock.getNextBlock() === draggable[0]) {
              this.connectionDBList.push([parentBlock.nextConnection, draggable[0].previousConnection]);
          }

          this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY());
      }

      for (const draggable of this.topSubDraggables) {
          draggable.startDrag();
      }
    }

    /**
     * Drags the subdraggables of the multiselectDraggable object if there are no other plugins that overwrite this method.
     * It delegates the drag methods to the topmost subdraggables.
     * @param newLoc The new location the object is being moved to (in Blockly coordinates)
     * @param e A drag event
     */
    drag(newLoc, e) {
            for (const draggable of this.topSubDraggables) {
          draggable.drag(Blockly.utils.Coordinate.sum(newLoc,this.subDraggables.get(draggable)), e);
      }
    }

    /**
     * Ends the drag of the subdraggables of the multiselectDraggable object if there are no other plugins that overwrite this method.
     * It delegates the endDrag methods to the topmost subdraggables.
     * @param e A drag event
     */
    endDrag(e) {
        for (const draggable of this.topSubDraggables) {
            draggable.endDrag(e);
        }

        for (const draggable of this.subDraggables) {
            // Update location of subdraggables
            draggable[1] = draggable[0].getRelativeToSurfaceXY();
          }
        // Reconnect any connections between blocks that are on the same level (not child/parent)
        this.connectionDBList.forEach(function(connectionDB) {
            connectionDB[0].connect(connectionDB[1]);
        })
        this.connectionDBList = [];
    }

    /**
     * Reverts any drags done on the multiselectDraggable object.
     */
    revertDrag() {
        for (const draggable of this.subDraggables) {
            draggable[0].revertDrag();
        }
    }

    // ISelectable methods
    /**
     * An empty function that is required for the multiselectDraggable object to be selectable.
     */
    select() {
        // This just needs to be an empty function
    }

    /**
     * An empty function that is required for the multiselectDraggable object to be selectable.
     */
    unselect() {
        // This just needs to be an empty function
    }


    // IDeletable methods
    /**
     * A function that is required for the multiselectDraggable object to be deletable.
     * @return {boolean}
     */
    isDeletable() {
        return true;
    }

    /**
     * Disposes all subdraggables in the multiselectDraggable object.
     */
    dispose() {
        for (const draggable of this.subDraggables) {
            this.removeSubDraggable(draggable[0]);
            draggable[0].dispose(true,true);
        }
    }

    /**
     * Returns a rectangular bound for the multiselectDraggable object needed to be compatible with the
     * Scroll Options plugin.
     * @return {Rect} A Blockly Rect that represents the bounds of the multiselectDraggable object.
     */
    getBoundingRectangle() {
        if (this.subDraggables.size === 0) {
            return new Blockly.utils.Rect(0, 0, 0, 0);
        }

        let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;

        this.subDraggables.forEach((coord, subDraggable) => {
            const boundingBox = subDraggable.getBoundingRectangle();
            top = Math.min(top, boundingBox.top);
            bottom = Math.max(bottom, boundingBox.bottom);
            left = Math.min(left, boundingBox.left);
            right = Math.max(right, boundingBox.right);
        });

        return new Blockly.utils.Rect(top, bottom, left, right);
    }
  }
