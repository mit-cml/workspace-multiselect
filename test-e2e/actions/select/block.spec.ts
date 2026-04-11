import { expect } from "@playwright/test";
import {
	getBlock,
	getHighlightedBlockIds,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test("double click collapses block", async ({ page, act }) => {
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
		page.mouse.dblclick(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect((await getBlock(page, { id: "block1" })).isCollapsed).toBe(true);
	expect((await getBlock(page, { id: "block2" })).isCollapsed).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("double click expands block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1", collapsed: true },
			{ type: "math_number", id: "block2", collapsed: true },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.dblclick(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect((await getBlock(page, { id: "block1" })).isCollapsed).toBe(false);
	expect((await getBlock(page, { id: "block2" })).isCollapsed).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("add comment to block", async ({ page, act }) => {
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
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Add Comment" }).click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block2" })).hasComment).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("remove comment from block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_number",
				id: "block1",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block2",
				icons: { comment: { text: "" } },
			},
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Remove Comment" }).click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block2" })).hasComment).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("switch block to external inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1" },
			{ type: "math_arithmetic", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "External Inputs" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block2" })).hasInlineInputs).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("switch block to inline inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1", inline: false },
			{ type: "math_arithmetic", id: "block2", inline: false },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Inline Inputs" }).click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block2" })).hasInlineInputs).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("disable block", async ({ page, act }) => {
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
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Disable Block" }).click(),
	);

	expect((await getBlock(page, { id: "block1" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block2" })).isEnabled).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("enable block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1", enabled: false },
			{ type: "math_number", id: "block2", enabled: false },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Enable Block" }).click(),
	);

	expect((await getBlock(page, { id: "block1" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block2" })).isEnabled).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("edit block comment", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_number",
				id: "block1",
				icons: { comment: { text: "" } },
			},
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.locator(".blocklyTextarea").click());
	// TODO: Blockly bug — should be:
	// expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	// expect(await getSelectedId(page)).toBe("block1");
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
	await act(page.keyboard.type("hello"));
	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("edit block mutator", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "procedures_defreturn", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	await act(page.locator(`g[data-id="block1"] .blockly-icon-mutator`).click());
	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
	await act(page.locator(".blocklyCheckbox").click());
	// TODO: Blockly bug — should be:
	// expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	// expect(await getSelectedId(page)).toBe("block1");
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).not.toBe("block1");
	await act(page.locator(`g[data-id="block1"] .blockly-icon-mutator`).click());

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});
