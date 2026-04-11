import { expect } from "@playwright/test";
import {
	getBlock,
	getEmptySpace,
	getGridSpacing,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test("shift click selects blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("shift click adds block to selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("shift click removes block from selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("shift click on empty space keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("releasing shift keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
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

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("clicking selected block keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
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

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("clicking selected child block keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_arithmetic",
				id: "parent",
				inputs: {
					A: { block: { type: "math_number", id: "child" } },
				},
			},
			{ type: "math_number", id: "other" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "parent" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "child" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "other" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "child" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual([
		"child",
		"other",
		"parent",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("clicking unselected block clears selection and selects it", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
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

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedId(page)).toBe("block3");
});

test("clicking unselected child block clears selection and selects it", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_arithmetic",
				id: "parent",
				inputs: {
					A: { block: { type: "math_number", id: "child" } },
				},
			},
			{ type: "math_number", id: "other" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "parent" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "other" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "child" })).centerTop),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["child"]);
	expect(await getSelectedId(page)).toBe("child");
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
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

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("shift dragging rectangle selects blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	const block1Bounds = (await getBlock(page, { id: "block1" })).bounds;
	const block2Bounds = (await getBlock(page, { id: "block2" })).bounds;
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.move(
			block1Bounds.left - halfGridSpacing,
			block1Bounds.top - halfGridSpacing,
		),
	);
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block2Bounds.right + halfGridSpacing,
			(block2Bounds.top + block2Bounds.bottom) / 2,
		),
	);
	await act(page.mouse.up());
	await act(page.keyboard.up("Shift"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("shift dragging rectangle deselects blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	const block1Bounds = (await getBlock(page, { id: "block1" })).bounds;
	const block2Bounds = (await getBlock(page, { id: "block2" })).bounds;
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.move(
			block1Bounds.left - halfGridSpacing,
			block1Bounds.top - halfGridSpacing,
		),
	);
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block2Bounds.right + halfGridSpacing,
			(block2Bounds.top + block2Bounds.bottom) / 2,
		),
	);
	await act(page.mouse.up());
	await act(page.keyboard.up("Shift"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("select all blocks via keyboard", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(page.keyboard.press("Control+A"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("select all blocks via context menu", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Select all Blocks" })
			.click(),
	);

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});
