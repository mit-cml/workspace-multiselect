import { expect } from "@playwright/test";
import {
	getBlock,
	getFocusedField,
	getHighlightedBlockIds,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
});

test("navigate up", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("navigate down", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedId(page)).toBe("block3");
});

test("navigate left", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowLeft"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getFocusedField(page)).toEqual({
		blockId: "block1",
		name: "BOOL",
	});
});

test("navigate right", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowRight"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getFocusedField(page)).toEqual({
		blockId: "block2",
		name: "NUM",
	});
});
