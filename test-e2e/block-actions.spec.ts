import { expect } from "@playwright/test";
import {
	getBlock,
	getBlockField,
	getBlockFieldValue,
	getSelectedBlockIds,
	hasBlockComment,
	hasInlineInputs,
	isBlockCollapsed,
	isBlockEnabled,
	loadBlocks,
	test,
} from "./test";

test("editing field updates all selected same-type blocks", async ({
	page,
	act,
}) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlockField(page, "block1", "NUM")));
	await page.keyboard.type("42");
	await act(page.keyboard.press("Enter"));

	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block3", "NUM")).toBe(0);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("double clicking collapses selected blocks", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3", collapsed: true },
		{ type: "math_number", id: "block4" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await page.keyboard.up("Shift");

	await act(page.mouse.dblclick(...(await getBlock(page, "block1"))));

	expect(await isBlockCollapsed(page, "block1")).toBe(true);
	expect(await isBlockCollapsed(page, "block2")).toBe(true);
	expect(await isBlockCollapsed(page, "block3")).toBe(true);
	expect(await isBlockCollapsed(page, "block4")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
});

test("double clicking expands selected blocks when all collapsed", async ({
	page,
	act,
}) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1", collapsed: true },
		{ type: "math_number", id: "block2", collapsed: true },
		{ type: "math_number", id: "block3", collapsed: true },
		{ type: "math_number", id: "block4", collapsed: true },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await page.keyboard.up("Shift");

	await act(page.mouse.dblclick(...(await getBlock(page, "block1"))));

	expect(await isBlockCollapsed(page, "block1")).toBe(false);
	expect(await isBlockCollapsed(page, "block2")).toBe(false);
	expect(await isBlockCollapsed(page, "block3")).toBe(false);
	expect(await isBlockCollapsed(page, "block4")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
});

test("add comment", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Add Comment (2)" }).click());

	expect(await hasBlockComment(page, "block1")).toBe(true);
	expect(await hasBlockComment(page, "block2")).toBe(true);
	expect(await hasBlockComment(page, "block3")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("remove comment", async ({ page, act }) => {
	const comment = { icons: { comment: { text: "" } } };
	await loadBlocks(page, [
		{ type: "math_number", id: "block1", ...comment },
		{ type: "math_number", id: "block2", ...comment },
		{ type: "math_number", id: "block3", ...comment },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Remove Comment (2)" }).click());

	expect(await hasBlockComment(page, "block1")).toBe(false);
	expect(await hasBlockComment(page, "block2")).toBe(false);
	expect(await hasBlockComment(page, "block3")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("external inputs", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_arithmetic", id: "block1" },
		{ type: "math_arithmetic", id: "block2" },
		{ type: "math_arithmetic", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(
		page.getByRole("menuitem", { name: "External Inputs (2)" }).click(),
	);

	expect(await hasInlineInputs(page, "block1")).toBe(false);
	expect(await hasInlineInputs(page, "block2")).toBe(false);
	expect(await hasInlineInputs(page, "block3")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("inline inputs", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_arithmetic", id: "block1", inline: false },
		{ type: "math_arithmetic", id: "block2", inline: false },
		{ type: "math_arithmetic", id: "block3", inline: false },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Inline Inputs (2)" }).click());

	expect(await hasInlineInputs(page, "block1")).toBe(true);
	expect(await hasInlineInputs(page, "block2")).toBe(true);
	expect(await hasInlineInputs(page, "block3")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("disable", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Disable Block (2)" }).click());

	expect(await isBlockEnabled(page, "block1")).toBe(false);
	expect(await isBlockEnabled(page, "block2")).toBe(false);
	expect(await isBlockEnabled(page, "block3")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("enable", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1", enabled: false },
		{ type: "math_number", id: "block2", enabled: false },
		{ type: "math_number", id: "block3", enabled: false },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Enable Block (2)" }).click());

	expect(await isBlockEnabled(page, "block1")).toBe(true);
	expect(await isBlockEnabled(page, "block2")).toBe(true);
	expect(await isBlockEnabled(page, "block3")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});
