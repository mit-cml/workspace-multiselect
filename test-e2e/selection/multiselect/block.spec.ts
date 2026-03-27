import { expect } from "@playwright/test";
import {
	getBlock,
	getBlockBounds,
	getEmptySpace,
	getFlyoutBlock,
	getGridSpacing,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "../../test";

test("shift click selects block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("shift click adds block to selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("shift click removes block from selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block2"]);
});

test("shift click on empty space keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("releasing shift keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	await act(page.keyboard.up("Shift"));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("clicking selected block keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
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
	await act(page.mouse.click(...(await getBlock(page, "parent"))));
	await act(page.mouse.click(...(await getBlock(page, "child"))));
	await act(page.mouse.click(...(await getBlock(page, "other"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlock(page, "child"))));

	expect(await getSelectedBlockIds(page)).toEqual(["child", "other", "parent"]);
});

test("clicking unselected block clears selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlock(page, "block3"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block3"]);
});

test("clicking unselected child block clears selection", async ({
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
	await act(page.mouse.click(...(await getBlock(page, "parent"))));
	await act(page.mouse.click(...(await getBlock(page, "other"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlock(page, "child"))));

	expect(await getSelectedBlockIds(page)).toEqual(["child"]);
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("shift dragging rectangle selects blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	const block1Bounds = await getBlockBounds(page, "block1");
	const block2Bounds = await getBlockBounds(page, "block2");
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

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("shift dragging rectangle deselects blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	const block1Bounds = await getBlockBounds(page, "block1");
	const block2Bounds = await getBlockBounds(page, "block2");
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
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

	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("select all blocks via keyboard", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(page.keyboard.press("Control+A"));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
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

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("opening toolbox keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("dragging block from toolbox selects new block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	await act(page.mouse.move(...(await getFlyoutBlock(page, "controls_if"))));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	const selectedIds = await getSelectedBlockIds(page);
	expect(selectedIds).toHaveLength(1);
	expect(selectedIds).not.toContain("block1");
	expect(selectedIds).not.toContain("block2");
});
