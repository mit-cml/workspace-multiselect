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

test("double click collapses blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3", collapsed: true },
			{ type: "math_number", id: "block4" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.keyboard.up("Shift"));

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

test("double click expands blocks when all collapsed", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1", collapsed: true },
			{ type: "math_number", id: "block2", collapsed: true },
			{ type: "math_number", id: "block3", collapsed: true },
			{ type: "math_number", id: "block4", collapsed: true },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.keyboard.up("Shift"));

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

test("add comment to blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
			{
				type: "math_number",
				id: "block4",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block5",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block6",
				icons: { comment: { text: "" } },
			},
			{ type: "math_number", id: "block7" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block2")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Add Comment (2)" })
			.click(),
	);

	expect(await hasBlockComment(page, "block1")).toBe(false);
	expect(await hasBlockComment(page, "block2")).toBe(true);
	expect(await hasBlockComment(page, "block3")).toBe(true);
	expect(await hasBlockComment(page, "block4")).toBe(true);
	expect(await hasBlockComment(page, "block5")).toBe(true);
	expect(await hasBlockComment(page, "block6")).toBe(true);
	expect(await hasBlockComment(page, "block7")).toBe(false);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});

test("remove comment from blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
			{
				type: "math_number",
				id: "block4",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block5",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block6",
				icons: { comment: { text: "" } },
			},
			{
				type: "math_number",
				id: "block7",
				icons: { comment: { text: "" } },
			},
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block4")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Remove Comment (3)" })
			.click(),
	);

	expect(await hasBlockComment(page, "block1")).toBe(false);
	expect(await hasBlockComment(page, "block2")).toBe(false);
	expect(await hasBlockComment(page, "block3")).toBe(false);
	expect(await hasBlockComment(page, "block4")).toBe(false);
	expect(await hasBlockComment(page, "block5")).toBe(false);
	expect(await hasBlockComment(page, "block6")).toBe(false);
	expect(await hasBlockComment(page, "block7")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});

test("switch blocks to external inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1" },
			{ type: "math_arithmetic", id: "block2" },
			{ type: "math_arithmetic", id: "block3" },
			{ type: "math_arithmetic", id: "block4", inline: false },
			{ type: "math_arithmetic", id: "block5", inline: false },
			{ type: "math_arithmetic", id: "block6", inline: false },
			{ type: "math_arithmetic", id: "block7" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block2")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "External Inputs (2)" })
			.click(),
	);

	expect(await hasInlineInputs(page, "block1")).toBe(true);
	expect(await hasInlineInputs(page, "block2")).toBe(false);
	expect(await hasInlineInputs(page, "block3")).toBe(false);
	expect(await hasInlineInputs(page, "block4")).toBe(false);
	expect(await hasInlineInputs(page, "block5")).toBe(false);
	expect(await hasInlineInputs(page, "block6")).toBe(false);
	expect(await hasInlineInputs(page, "block7")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});

test("switch blocks to inline inputs", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_arithmetic", id: "block1" },
			{ type: "math_arithmetic", id: "block2" },
			{ type: "math_arithmetic", id: "block3" },
			{ type: "math_arithmetic", id: "block4", inline: false },
			{ type: "math_arithmetic", id: "block5", inline: false },
			{ type: "math_arithmetic", id: "block6", inline: false },
			{ type: "math_arithmetic", id: "block7" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block4")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Inline Inputs (3)" })
			.click(),
	);

	expect(await hasInlineInputs(page, "block1")).toBe(true);
	expect(await hasInlineInputs(page, "block2")).toBe(true);
	expect(await hasInlineInputs(page, "block3")).toBe(true);
	expect(await hasInlineInputs(page, "block4")).toBe(true);
	expect(await hasInlineInputs(page, "block5")).toBe(true);
	expect(await hasInlineInputs(page, "block6")).toBe(true);
	expect(await hasInlineInputs(page, "block7")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});

test("disable blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
			{ type: "math_number", id: "block4", enabled: false },
			{ type: "math_number", id: "block5", enabled: false },
			{ type: "math_number", id: "block6", enabled: false },
			{ type: "math_number", id: "block7" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block2")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Disable Block (2)" })
			.click(),
	);

	expect(await isBlockEnabled(page, "block1")).toBe(true);
	expect(await isBlockEnabled(page, "block2")).toBe(false);
	expect(await isBlockEnabled(page, "block3")).toBe(false);
	expect(await isBlockEnabled(page, "block4")).toBe(false);
	expect(await isBlockEnabled(page, "block5")).toBe(false);
	expect(await isBlockEnabled(page, "block6")).toBe(false);
	expect(await isBlockEnabled(page, "block7")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});

test("enable blocks", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
			{ type: "math_number", id: "block4", enabled: false },
			{ type: "math_number", id: "block5", enabled: false },
			{ type: "math_number", id: "block6", enabled: false },
			{ type: "math_number", id: "block7" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.mouse.click(...(await getBlock(page, "block3"))));
	await act(page.mouse.click(...(await getBlock(page, "block4"))));
	await act(page.mouse.click(...(await getBlock(page, "block5"))));
	await act(page.mouse.click(...(await getBlock(page, "block6"))));
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, "block4")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Enable Block (3)" })
			.click(),
	);

	expect(await isBlockEnabled(page, "block1")).toBe(true);
	expect(await isBlockEnabled(page, "block2")).toBe(true);
	expect(await isBlockEnabled(page, "block3")).toBe(true);
	expect(await isBlockEnabled(page, "block4")).toBe(true);
	expect(await isBlockEnabled(page, "block5")).toBe(true);
	expect(await isBlockEnabled(page, "block6")).toBe(true);
	expect(await isBlockEnabled(page, "block7")).toBe(true);
	expect(await getSelectedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
});
