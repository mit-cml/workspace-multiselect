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

    // TODO: Need to determine what is needed in constructor
    constructor(workspace) {
        this.workspace = workspace;
        this.id = Blockly.utils.idGenerator.genUid();
        this.subDraggables = new Map();
        this.topSubDraggables = new Array();
        this.loc = new Blockly.utils.Coordinate(0,0);
        this.connectionDBList = new Array();
    }

    clearAll() {
        for (const subDraggable in this.subDraggables) {
            this.removeSubDraggable(subDraggable);
        }
    }

    // TODO: Finish implementing these methods
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
        console.log("added pointer down event listener")
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
        this.topSubDraggables = [];
      for (const draggable of this.subDraggables) {
          if (!(hasSelectedParent(draggable[0], true))) {
              this.topSubDraggables.push(draggable[0])
          }
          // console.log("startingDrag of subdraggables: ", draggable[0])
          // console.log("connections", draggable[0].getConnections_(false))
          // const connections = draggable[0].getConnections_(false);
          // connections.forEach(connection => {
          //     console.log(`Block ${draggable[0].id} connection status: `, connection.isConnected());
          //     console.log("connection type: ", connection.type);
          // });
          // console.log("connection candidate", draggable[0].dragStrategy.connectionCandidate)

          // const connectionInfo = connections.map(connection => {
          //     return {
          //         connection: connection,
          //         targetConnection: connection.targetConnection,
          //     };
          // });
          // this.savedConnections.set(draggable[0], connectionInfo);

          const parentBlock = draggable[0].getParent();
          console.log("original block,", draggable[0])
          if (parentBlock) {
              console.log("parentblock's next block", parentBlock.getNextBlock())
          }
          console.log("parent block, ", parentBlock)
          console.log(this.subDraggables.keys())
          console.log("parent block in subdragables: ", this.subDraggables.has(parentBlock))
          if (parentBlock && this.subDraggables.has(parentBlock) && parentBlock.getNextBlock() === draggable[0]) {
              console.log("ADDING TO DB LIST!!!!!!!!!!!")
              this.connectionDBList.push([parentBlock.nextConnection, draggable[0].previousConnection])
          }


          this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY())
          // draggable[0].startDrag()
      }

      for (const draggable of this.topSubDraggables) {
          draggable.startDrag();
      }
    }

    drag(newLoc, e) {
        console.log("drag -> newLoc coords", newLoc)
      for (const draggable of this.subDraggables) {
          console.log(draggable)
          // draggable[0].drag(Blockly.utils.Coordinate.sum(newLoc,this.subDraggables.get(draggable[0])), e);
          // draggable[0].drag((newLoc), e);
          // this.subDraggables.set(draggable[0], draggable[0].getRelativeToSurfaceXY())
      }

      for (const draggable of this.topSubDraggables) {
          draggable.drag(Blockly.utils.Coordinate.sum(newLoc,this.subDraggables.get(draggable)), e);
      }
    }

    endDrag(e) {
        console.log("endDrag")
        console.log("connectionDBList: ", this.connectionDBList)
        console.log("draggingConn: ", Blockly.common.draggingConnections)

        for (const draggable of this.topSubDraggables) {
            draggable.endDrag(e);
        }

        for (const draggable of this.subDraggables) {
            // draggable[0].endDrag(e);
            // console.log("connected?", draggable[0].previousConnection.isConnected())
            console.log("connections", draggable[0].getConnections_(false))

            // Calculate delta of drag in coordinates ==========
            const delta = Blockly.utils.Coordinate.difference(draggable[0].getRelativeToSurfaceXY(), draggable[1])
            console.log("delta", delta)

            // Update location of subdraggables ============
            draggable[1] = draggable[0].getRelativeToSurfaceXY();
          }
        this.connectionDBList.forEach(function(connectionDB) {
            connectionDB[0].connect(connectionDB[1]);
        })
        this.connectionDBList = []
    }

    revertDrag() {
        for (const draggable of this.subDraggables) {
            draggable[0].revertDrag();
        }
    }

    // ISelectable methods
    select() {
        // This just needs to be an empty function
    }

    unselect() {
        // This just needs to be an empty function
    }


    // IDeletable methods
    isDeletable() {
        return true;
    }

    dispose() {
        for (const draggable of this.subDraggables) {
            this.removeSubDraggable(draggable[0]);
            draggable[0].dispose(true,true);
        }
    }

    setDeleteStyle() {
        // Visually indicate that the draggable is about to be deleted.
    }

    // ICopyable methods
    // toCopyData() {
    //     return {
    //         // This string matches the string used to register the paster.
    //         paster: 'MY_PASTER',
    //         state: this.myState,
    //     };
    // }

  }
