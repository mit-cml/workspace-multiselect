import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getBlock,
	getEmptySpace,
	getGridSpacing,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	getTrash,
	loadBlocks,
	openTrash,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));
});

test("duplicate blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page.getByRole("menuitem", { exact: true, name: "Duplicate (2)" }).click(),
	);

	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(5);
	const newBlockIds = allBlockIds.filter(
		(id) => !["block1", "block2", "block3"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(newBlockIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedId(page)).toBe("block3");
	await act(page.locator(".blocklyMultiselect image").click());

	await act(page.keyboard.press("Control+V"));
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(5);
	const newBlockIds = allBlockIds.filter(
		(id) => !["block1", "block2", "block3"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(newBlockIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page.getByRole("menuitem", { exact: true, name: "Copy (2)" }).click(),
	);
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Paste (2)" }).click(),
	);
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(5);
	const newBlockIds = allBlockIds.filter(
		(id) => !["block1", "block2", "block3"].includes(id),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(newBlockIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("cut and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("delete blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("delete blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Delete 2 Blocks" })
			.click(),
	);

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("drag blocks to trash", async ({ page, act }) => {
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getTrash(page))));
	await act(page.mouse.up());

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await openTrash(page);
	await getBlock(page, { type: "logic_boolean", workspace: "trash" });
	await getBlock(page, { type: "math_number", workspace: "trash" });
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
});

test("drag blocks", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;
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
	const block3BoundsEnd = (await getBlock(page, { id: "block3" })).bounds;
	expect(block1BoundsEnd.left - block1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block1BoundsEnd.top - block1BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block2BoundsEnd.left - block2BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block2BoundsEnd.top - block2BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block3BoundsEnd.left).toBeCloseTo(block3BoundsStart.left);
	expect(block3BoundsEnd.top).toBeCloseTo(block3BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});
