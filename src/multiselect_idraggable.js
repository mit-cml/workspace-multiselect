/**
 * @license
 * Copyright 2024 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multiple selection draggable class.
 */
import * as Blockly from 'blockly/core';
// This import is only if I decide to extend the MultiDraggable class
import {MultiDraggable} from "./multi_draggable";
import {Coordinate} from "blockly/core/utils/coordinate";

/**
 * A draggable object that adds the functionality for multiple blocks to
 * be moved while someone is dragging it. It implements the IDraggable interface in Blockly v11.
 */
export class MultiselectDraggable {

    // TODO: Need to determine what is needed in constructor
    constructor(workspace, subDraggables) {
        this.workspace_ = workspace;
        this.subDraggables = subDraggables;
        this.view
        this.svgRoot
        this.loc
    }

    // TODO: Need to determine how to implement this after talking to mentor
    addSubDraggable(subBlock) {

    }

    // TODO: Need to determine if blocks will always be movable
    isMovable() {
        return true;
    }

    /**
     * Returns the root SVG element of the multiselect-draggable.
     * @returns {SVGElement} The root SVG element of this rendered multiselect-draggable element.
     */
    getSvgRoot() {

    }

    // TODO: Complete these methods

    /**
     * Returns the current location of the multiselect-draggable in workspace coordinates.
     * @returns {Coordinate} The coordinate of the current location on workspace (top left corner of multiselect-draggable)
     */
    getRelativeToSurfaceXY() {
        return this.loc;
    }


    // TODO: Need to implement startDrag
    startDrag(e) {
      for (const draggable of this.subDraggables) {
        draggable.startDrag(e);
      }
    }

    // TODO: Need to implement drag
    drag(newLoc, e, target) {
      for (const draggable of this.subDraggables) {
        draggable.drag(Coordinate.sum(newLoc, draggable.dragOffset), target, e);
      }
    }

    // TODO: Need to implement endDrag
    endDrag(e: PointerEvent) {
      for (const draggable of this.subDraggables) {
        draggable.endDrag(e);
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



  }

Blockly.registry.register(Blockly.registry.Type.MULTI_DRAGGABLE,
    'MultiselectDraggable', MultiselectDraggable);