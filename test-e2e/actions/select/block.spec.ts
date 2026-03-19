import { expect } from "@playwright/test";
import {
	getBlock,
	getSelectedBlockIds,
	hasBlockComment,
	hasInlineInputs,
	isBlockCollapsed,
	isBlockEnabled,
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
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.dblclick(...(await getBlock(page, "block1"))));

	expect(await isBlockCollapsed(page, "block1")).toBe(true);
	expect(await isBlockCollapsed(page, "block2")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("double click expands block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1", collapsed: true },
			{ type: "math_number", id: "block2", collapsed: true },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(page.mouse.dblclick(...(await getBlock(page, "block1"))));

	expect(await isBlockCollapsed(page, "block1")).toBe(false);
	expect(await isBlockCollapsed(page, "block2")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("add comment to block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Add Comment" }).click(),
	);

	expect(await hasBlockComment(page, "block1")).toBe(true);
	expect(await hasBlockComment(page, "block2")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
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
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Remove Comment" }).click(),
	);

	expect(await hasBlockComment(page, "block1")).toBe(false);
	expect(await hasBlockComment(page, "block2")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("switch block to external inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1" },
			{ type: "math_arithmetic", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "External Inputs" })
			.click(),
	);

	expect(await hasInlineInputs(page, "block1")).toBe(false);
	expect(await hasInlineInputs(page, "block2")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("switch block to inline inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1", inline: false },
			{ type: "math_arithmetic", id: "block2", inline: false },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Inline Inputs" }).click(),
	);

	expect(await hasInlineInputs(page, "block1")).toBe(true);
	expect(await hasInlineInputs(page, "block2")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("disable block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Disable Block" }).click(),
	);

	expect(await isBlockEnabled(page, "block1")).toBe(false);
	expect(await isBlockEnabled(page, "block2")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});

test("enable block", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1", enabled: false },
			{ type: "math_number", id: "block2", enabled: false },
		]),
	);
	await act(page.mouse.click(...(await getBlock(page, "block1"))));

	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Enable Block" }).click(),
	);

	expect(await isBlockEnabled(page, "block1")).toBe(true);
	expect(await isBlockEnabled(page, "block2")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual(["block1"]);
});
