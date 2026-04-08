import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	getAllBlockIds,
	getBackpack,
	getBlock,
	getEmptySpace,
	getGridSpacing,
	getHighlightedBlockIds,
	getSelectedId,
	getTrash,
	isEphemeralFocusTaken,
	loadBlocks,
	openBackpack,
	openTrash,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
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
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
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
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("copy and paste block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("C")));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");

	await act(page.keyboard.press(cmdOrCtrl("V")));
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
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
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
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("cut and paste block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("X")));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");

	await act(page.keyboard.press(cmdOrCtrl("V")));
	expect(await getAllBlockIds(page)).toHaveLength(2);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(highlightedBlockIds).toHaveLength(1);
	expect(highlightedBlockIds).not.toContain("block2");
	expect(await getSelectedId(page)).toBe(highlightedBlockIds[0]);
});

test("delete block via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("delete block via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Delete Block" }).click(),
	);

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("drag block to trash", async ({ page, act }) => {
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getTrash(page))));
	await act(page.mouse.up());

	expect(await getAllBlockIds(page)).toEqual(["block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");

	await openTrash(page);
	await getBlock(page, { type: "logic_boolean", workspace: "trash" });
});

test("drag block from trash", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await openTrash(page);
	await act(
		page.mouse.move(
			...(await getBlock(page, { type: "logic_boolean", workspace: "trash" }))
				.centerTop,
		),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(2);
	const [newBlockId] = allBlockIds.filter((id) => id !== "block2");
	expect(await getHighlightedBlockIds(page)).toEqual([newBlockId]);
	expect(await getSelectedId(page)).toBe(newBlockId);
});

test("drag block to backpack", async ({ page, act }) => {
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getBackpack(page))));
	await act(page.mouse.up());

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	const block1BoundsEnd = (await getBlock(page, { id: "block1" })).bounds;
	expect(block1BoundsEnd.left).toBe(block1BoundsStart.left);
	expect(block1BoundsEnd.top).toBe(block1BoundsStart.top);

	await openBackpack(page);
	await getBlock(page, { type: "logic_boolean", workspace: "backpack" });
});

test("drag block from backpack", async ({ page, act }) => {
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getBackpack(page))));
	await act(page.mouse.up());

	await openBackpack(page);
	await act(
		page.mouse.move(
			...(
				await getBlock(page, {
					type: "logic_boolean",
					workspace: "backpack",
				})
			).centerTop,
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

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block2"]);

	await act(page.keyboard.press(cmdOrCtrl("Z")));

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
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
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
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});
