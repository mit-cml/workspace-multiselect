import { expect } from "@playwright/test";
import {
	getBlock,
	getBlockField,
	getBlockFieldValue,
	getHighlightedBlockIds,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test("edit boolean field", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "logic_boolean", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getBlockField(page, "block1", "BOOL"))));
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.getByRole("option", { name: "false", exact: true }).click());

	expect(await getBlockFieldValue(page, "block1", "BOOL")).toBe("FALSE");
	expect(await getBlockFieldValue(page, "block2", "BOOL")).toBe("TRUE");
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("edit number field", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.click(...(await getBlockField(page, "block1", "NUM"))));
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.keyboard.type("42"));
	await act(page.keyboard.press("Enter"));

	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(0);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});
