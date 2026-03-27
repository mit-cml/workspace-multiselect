import { expect } from "@playwright/test";
import {
	getBlock,
	getEmptySpace,
	getFlyoutBlock,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "../../test";

test("clicking block selects it", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);

	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("clicking selected block keeps selection", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("clicking child of selected block selects child", async ({
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
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "parent"))));

	await act(page.mouse.click(...(await getBlock(page, "child"))));

	expect(await getSelectedBlockIds(page)).toEqual(["child"]);
});

test("clicking unselected block selects it", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getBlock(page, "block2"))));

	expect(await getSelectedBlockIds(page)).toEqual(["block2"]);
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("opening toolbox keeps selection", async ({ page, act }) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());

	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("dragging block from toolbox selects new block", async ({ page, act }) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	await act(page.mouse.move(...(await getFlyoutBlock(page, "controls_if"))));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	const selectedIds = await getSelectedBlockIds(page);
	expect(selectedIds).toHaveLength(1);
	expect(selectedIds).not.toContain("block1");
});
