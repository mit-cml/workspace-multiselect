import { expect } from "@playwright/test";
import {
	getBlock,
	getBlockField,
	getBlockFieldValue,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "../test";

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
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlockField(page, "block1", "BOOL"))));
	await act(page.getByRole("option", { name: "FALSE" }).click());

	expect(await getBlockFieldValue(page, "block1", "BOOL")).toBe("FALSE");
	expect(await getBlockFieldValue(page, "block2", "BOOL")).toBe("FALSE");
	expect(await getBlockFieldValue(page, "block3", "NUM")).toBe(0);
	expect(await getBlockFieldValue(page, "block4", "BOOL")).toBe("TRUE");
	expect(await getSelectedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
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
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getBlockField(page, "block1", "NUM"))));
	await act(page.keyboard.type("4"));
	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(4);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(4);

	await act(page.keyboard.type("2"));
	await act(page.keyboard.press("Enter"));
	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block3", "BOOL")).toBe("TRUE");
	expect(await getBlockFieldValue(page, "block4", "NUM")).toBe(0);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
});

test("undo boolean field multi-edit", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "logic_boolean", id: "block2" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));
	await act(page.mouse.click(...(await getBlockField(page, "block1", "BOOL"))));
	await act(page.getByRole("option", { name: "FALSE" }).click());
	expect(await getBlockFieldValue(page, "block1", "BOOL")).toBe("FALSE");
	expect(await getBlockFieldValue(page, "block2", "BOOL")).toBe("FALSE");

	await act(page.keyboard.press("Control+Z"));

	expect(await getBlockFieldValue(page, "block1", "BOOL")).toBe("TRUE");
	expect(await getBlockFieldValue(page, "block2", "BOOL")).toBe("TRUE");
});

test("undo number field multi-edit", async ({ page, act }) => {
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
	await act(page.mouse.click(...(await getBlockField(page, "block1", "NUM"))));
	await act(page.keyboard.type("42"));
	await act(page.keyboard.press("Enter"));
	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(42);

	await act(page.keyboard.press("Control+Z"));

	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(0);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(0);
});
