/**
 * @license
 * Copyright 2026 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview NavigationPolicy for MultiselectDraggable.
 */

import * as Blockly from "blockly/core";
import { MultiselectDraggable } from "./multiselect_draggable";

/**
 * NavigationPolicy that treats MultiselectDraggable as
 * a top-level block with no navigable children.
 */
export class MultiselectNavigationPolicy {
	getFirstChild(_selection) {
		return null;
	}

	getParent(selection) {
		return selection.workspace;
	}

	getNextSibling(selection) {
		const { bottomBlock } =
			MultiselectNavigationPolicy.getSelectionBounds(selection);
		if (bottomBlock instanceof Blockly.comments.RenderedWorkspaceComment) {
			return Blockly.navigateStacks(bottomBlock, 1);
		}
		const anchor =
			MultiselectNavigationPolicy.findStatementAncestor(bottomBlock);
		return anchor.getNextBlock() || Blockly.navigateStacks(anchor, 1);
	}

	getPreviousSibling(selection) {
		const { topBlock } =
			MultiselectNavigationPolicy.getSelectionBounds(selection);
		if (topBlock instanceof Blockly.comments.RenderedWorkspaceComment) {
			return Blockly.navigateStacks(topBlock, -1);
		}
		const anchor = MultiselectNavigationPolicy.findStatementAncestor(topBlock);
		return anchor.getPreviousBlock() || Blockly.navigateStacks(anchor, -1);
	}

	isNavigable(selection) {
		return selection.canBeFocused();
	}

	isApplicable(selection) {
		return selection instanceof MultiselectDraggable;
	}

	static findStatementAncestor(block) {
		let current = block;
		while (current && !current.previousConnection) {
			current = current.getParent();
		}
		return current || block;
	}

	static getSelectionBounds(selection) {
		const selected = [...selection.subDraggables.keys()];
		selected.sort((a, b) =>
			MultiselectNavigationPolicy.sortByOrigin(selection.workspace, a, b),
		);
		return {
			topBlock: selected[0],
			bottomBlock: selected[selected.length - 1],
		};
	}

	static getSelectedStacks(selection) {
		const stacks = new Map();
		for (const [selected] of selection.subDraggables) {
			const stack =
				selected instanceof Blockly.comments.RenderedWorkspaceComment
					? selected
					: selected.getRootBlock();
			stacks.set(stack.id, stack);
		}
		return [...stacks.values()].sort((a, b) =>
			MultiselectNavigationPolicy.sortByOrigin(selection.workspace, a, b),
		);
	}

	/**
	 * Angle away from the horizontal to sweep for blocks.  Order of execution is
	 * generally top to bottom, but a small angle changes the scan to give a bit
	 * of a left to right bias (reversed in RTL).  Units are in degrees. See:
	 * https://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling
	 *
	 * Copied from https://github.com/RaspberryPiFoundation/blockly/blob/blockly-v12.5.1/packages/blockly/core/workspace.ts#L48-L54
	 *
	 */
	static SCAN_ANGLE = 3;

	/**
	 * Sorts bounded elements on the workspace by their relative position, top to
	 * bottom (with slight LTR or RTL bias).
	 *
	 * Copied from https://github.com/RaspberryPiFoundation/blockly/blob/blockly-v12.5.1/packages/blockly/core/workspace.ts#L198-L212
	 *
	 * @param workspace The workspace the elements belong to.
	 * @param a The first element to sort.
	 * @param b The second elment to sort.
	 * @returns -1, 0 or 1 depending on the sort order.
	 */
	static sortByOrigin(workspace, a, b) {
		const offset =
			Math.sin(
				Blockly.utils.math.toRadians(MultiselectNavigationPolicy.SCAN_ANGLE),
			) * (workspace.RTL ? -1 : 1);
		const aXY = a.getBoundingRectangle().getOrigin();
		const bXY = b.getBoundingRectangle().getOrigin();
		return aXY.y + offset * aXY.x - (bXY.y + offset * bXY.x);
	}

	install() {
		Blockly.ShortcutRegistry.registry.register({
			name: "multiselect_previous_stack",
			allowCollision: true,
			preconditionFn: () =>
				Blockly.getSelected() instanceof MultiselectDraggable,
			callback: (workspace) => {
				const stacks = MultiselectNavigationPolicy.getSelectedStacks(
					Blockly.getSelected(),
				);
				workspace.getCursor().setCurNode(Blockly.navigateStacks(stacks[0], -1));
				return true;
			},
			keyCodes: [Blockly.utils.KeyCodes.B],
		});

		Blockly.ShortcutRegistry.registry.register({
			name: "multiselect_next_stack",
			allowCollision: true,
			preconditionFn: () =>
				Blockly.getSelected() instanceof MultiselectDraggable,
			callback: (workspace) => {
				const stacks = MultiselectNavigationPolicy.getSelectedStacks(
					Blockly.getSelected(),
				);
				workspace
					.getCursor()
					.setCurNode(Blockly.navigateStacks(stacks[stacks.length - 1], 1));
				return true;
			},
			keyCodes: [Blockly.utils.KeyCodes.N],
		});
	}

	uninstall() {
		Blockly.ShortcutRegistry.registry.unregister("multiselect_previous_stack");
		Blockly.ShortcutRegistry.registry.unregister("multiselect_next_stack");
	}
}
