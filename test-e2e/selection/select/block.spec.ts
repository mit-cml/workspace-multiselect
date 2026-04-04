import { expect } from "@playwright/test";
import {
	getBlock,
	getEmptySpace,
	getHighlightedBlockIds,
	getSelectedId,
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

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
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

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("clicking child of selected block selects it", async ({ page, act }) => {
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

	expect(await getHighlightedBlockIds(page)).toEqual(["child"]);
	expect(await getSelectedId(page)).toBe("child");
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

	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});
