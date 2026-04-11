import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getBlock,
	getEmptySpace,
	getGridSpacing,
	getHighlightedBlockIds,
	getSelectedId,
	loadBlocks,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
});

test("duplicate block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
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
	expect(await getSelectedId(page)).toBe(newBlockId);
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
	expect(await getSelectedId(page)).toBe(newBlockId);
});

test("copy and paste block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
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
	expect(await getSelectedId(page)).toBe(newBlockId);
});

test("cut and paste block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("delete block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("delete block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
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
	expect(await getSelectedId(page)).toBeNull();
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
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const [block1Center, block1Top] = (await getBlock(page, { id: "block1" }))
		.centerTop;

	await act(page.mouse.move(block1Center, block1Top));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block1Center + halfGridSpacing + 1,
			block1Top + halfGridSpacing + 1,
		),
	);
	await act(page.mouse.up());

	const block1BoundsEnd = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
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
	await act(
		page.mouse.move(
			...(await getBlock(page, { type: "controls_if", workspace: "toolbox" }))
				.centerTop,
		),
	);
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
