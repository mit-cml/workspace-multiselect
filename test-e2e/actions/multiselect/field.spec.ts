declare global {
	interface Window {
		validatorCallCounts: Record<string, number>;
	}
}

import { expect } from "@playwright/test";
import {
	getBlock,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	isEphemeralFocusTaken,
	loadBlocks,
	test,
} from "../../test";

test("editing boolean field updates selected boolean blocks", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "logic_boolean", id: "block2" },
			{ type: "math_number", id: "block3" },
			{ type: "logic_boolean", id: "block4" },
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
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);

	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.BOOL.center,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(page.getByRole("option", { name: "false", exact: true }).click());

	expect((await getBlock(page, { id: "block1" })).fields.BOOL.value).toBe(
		"FALSE",
	);
	expect((await getBlock(page, { id: "block2" })).fields.BOOL.value).toBe(
		"FALSE",
	);
	expect((await getBlock(page, { id: "block3" })).fields.NUM.value).toBe(0);
	expect((await getBlock(page, { id: "block4" })).fields.BOOL.value).toBe(
		"TRUE",
	);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("undo boolean field multi-edit", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "logic_boolean", id: "block2" },
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
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.BOOL.center,
		),
	);
	await act(page.getByRole("option", { name: "false", exact: true }).click());
	expect((await getBlock(page, { id: "block1" })).fields.BOOL.value).toBe(
		"FALSE",
	);
	expect((await getBlock(page, { id: "block2" })).fields.BOOL.value).toBe(
		"FALSE",
	);

	await act(page.keyboard.press("Control+Z"));

	expect((await getBlock(page, { id: "block1" })).fields.BOOL.value).toBe(
		"TRUE",
	);
	expect((await getBlock(page, { id: "block2" })).fields.BOOL.value).toBe(
		"TRUE",
	);
});

test("editing number field updates selected number blocks", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "logic_boolean", id: "block3" },
			{ type: "math_number", id: "block4" },
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
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);

	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.NUM.center,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(page.keyboard.type("4"));
	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe(4);
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(4);

	await act(page.keyboard.type("2"));
	await act(page.keyboard.press("Enter"));
	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe(42);
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(42);
	expect((await getBlock(page, { id: "block3" })).fields.BOOL.value).toBe(
		"TRUE",
	);
	expect((await getBlock(page, { id: "block4" })).fields.NUM.value).toBe(0);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("undo number field multi-edit", async ({ page, act }) => {
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
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.NUM.center,
		),
	);
	await act(page.keyboard.type("42"));
	await act(page.keyboard.press("Enter"));
	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe(42);
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(42);

	await act(page.keyboard.press("Control+Z"));

	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe(0);
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(0);
});

test("dependent field recalculated during multi-edit", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "radix", id: "block1", fields: { NUM: "7" } },
			{ type: "radix", id: "block2", fields: { NUM: "42" } },
			{ type: "math_number", id: "block3" },
			{ type: "radix", id: "block4" },
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
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);

	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.RADIX.center,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(page.getByRole("option", { name: "binary", exact: true }).click());

	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe("111");
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(
		"101010",
	);
	expect((await getBlock(page, { id: "block3" })).fields.NUM.value).toBe(0);
	expect((await getBlock(page, { id: "block4" })).fields.NUM.value).toBe("0");
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("undo multi-edit recalculates dependent field", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "radix", id: "block1", fields: { NUM: "7" } },
			{ type: "radix", id: "block2", fields: { NUM: "42" } },
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
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.RADIX.center,
		),
	);
	await act(page.getByRole("option", { name: "binary", exact: true }).click());
	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe("111");
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe(
		"101010",
	);

	await act(page.keyboard.press("Control+Z"));

	expect((await getBlock(page, { id: "block1" })).fields.NUM.value).toBe("7");
	expect((await getBlock(page, { id: "block2" })).fields.NUM.value).toBe("42");
});

test("validator runs once per selected block during multi-edit", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "validator_call_counter", id: "block1" },
			{ type: "validator_call_counter", id: "block2" },
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
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.VALUE.center,
		),
	);
	await act(page.getByRole("option", { name: "b", exact: true }).click());
	expect((await getBlock(page, { id: "block1" })).fields.VALUE.value).toBe("B");
	expect((await getBlock(page, { id: "block2" })).fields.VALUE.value).toBe("B");

	expect(await page.evaluate(() => window.validatorCallCounts.block1)).toBe(1);
	expect(await page.evaluate(() => window.validatorCallCounts.block2)).toBe(1);
});
