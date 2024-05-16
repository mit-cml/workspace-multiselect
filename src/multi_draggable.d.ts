import {IDraggable, WorkspaceSvg} from "blockly";
import {Coordinate} from "blockly/core/utils/coordinate";
import * as Blockly from "blockly/core";

// A class that extends the IDraggable interface that may/not be needed
export declare class MultiDraggable implements IDraggable {
    private workspace_: WorkspaceSvg;
    private subDraggables: Blockly.IDraggable[];

    constructor(workspace: WorkspaceSvg);

    addSubDraggable(subBlock: Blockly.IDraggable): void;

    drag(newLoc: Coordinate, e?: PointerEvent): void;

    endDrag(e?: PointerEvent): void;

    getRelativeToSurfaceXY(): Coordinate;

    isMovable(): boolean;

    revertDrag(): void;

    startDrag(e?: PointerEvent): void;

}