import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getBlock,
	getBlockBounds,
	getEmptySpace,
	getFlyoutBlock,
	getGridSpacing,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
});

test("duplicate block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Duplicate" }).click(),
	);

	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(3);
	const [newBlockId] = allBlockIds.filter(
		(id) => !["block1", "block2"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([newBlockId]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBe(newBlockId);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");

	await act(page.keyboard.press("Control+V"));
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(3);
	const [newBlockId] = allBlockIds.filter(
		(id) => !["block1", "block2"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([newBlockId]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBe(newBlockId);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.getByRole("menuitem", { exact: true, name: "Copy" }).click());
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Paste" }).click());
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(3);
	const [newBlockId] = allBlockIds.filter(
		(id) => !["block1", "block2"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([newBlockId]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBe(newBlockId);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("cut and paste block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBe("block1");
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("delete block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBeNull();
	expect(await getSelectedId(page)).toBe("block1");
});

test("delete block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Delete Block" }).click(),
	);

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	// TODO: plugin bug — should be:
	// expect(await getSelectedId(page)).toBeNull();
	expect(await getSelectedId(page)).toBe("block1");
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
});

test("drag block", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const block1BoundsStart = await getBlockBounds(page, "block1");
	const block2BoundsStart = await getBlockBounds(page, "block2");
	const [block1X, block1Y] = await getBlock(page, "block1");

	await act(page.mouse.move(block1X, block1Y));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block1X + halfGridSpacing + 1,
			block1Y + halfGridSpacing + 1,
		),
	);
	await act(page.mouse.up());

	const block1BoundsEnd = await getBlockBounds(page, "block1");
	const block2BoundsEnd = await getBlockBounds(page, "block2");
	expect(block1BoundsEnd.left - block1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block1BoundsEnd.top - block1BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block2BoundsEnd.left).toBeCloseTo(block2BoundsStart.left);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("dragging block from toolbox selects new block", async ({ page, act }) => {
	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.mouse.move(...(await getFlyoutBlock(page, "controls_if"))));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(3);
	const [newBlockId] = allBlockIds.filter(
		(id) => !["block1", "block2"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([newBlockId]);
	expect(await getSelectedId(page)).toBe(newBlockId);
});
