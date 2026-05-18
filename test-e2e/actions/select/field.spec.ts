import { expect } from "@playwright/test";
import {
	getBlock,
	getHighlightedBlockIds,
	getSelectedId,
	isEphemeralFocusTaken,
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.BOOL.center,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(page.getByRole("option", { name: "false", exact: true }).click());

	expect((await getBlock(page, { id: "block1" })).fields.BOOL.value).toBe(
		"FALSE",
	);
	expect((await getBlock(page, { id: "block2" })).fields.BOOL.value).toBe(
		"TRUE",
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("edit number field", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.NUM.center,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(page.keyboard.type("42"));
	await act(page.keyboard.press("Enter"));

	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe(42);
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(0);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});
