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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.dblclick(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect((await getBlock(page, { id: "block1" })).isCollapsed).toBe(true);
	expect((await getBlock(page, { id: "block2" })).isCollapsed).toBe(true);
	expect((await getBlock(page, { id: "block3" })).isCollapsed).toBe(true);
	expect((await getBlock(page, { id: "block4" })).isCollapsed).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.dblclick(...(await getBlock(page, { id: "block1" })).centerTop),
	);

	expect((await getBlock(page, { id: "block1" })).isCollapsed).toBe(false);
	expect((await getBlock(page, { id: "block2" })).isCollapsed).toBe(false);
	expect((await getBlock(page, { id: "block3" })).isCollapsed).toBe(false);
	expect((await getBlock(page, { id: "block4" })).isCollapsed).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Add Comment (2)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block2" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block3" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block4" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block5" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block6" })).hasComment).toBe(true);
	expect((await getBlock(page, { id: "block7" })).hasComment).toBe(false);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Remove Comment (3)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block2" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block3" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block4" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block5" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block6" })).hasComment).toBe(false);
	expect((await getBlock(page, { id: "block7" })).hasComment).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "External Inputs (2)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block2" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block3" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block4" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block5" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block6" })).hasInlineInputs).toBe(false);
	expect((await getBlock(page, { id: "block7" })).hasInlineInputs).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Inline Inputs (3)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block2" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block3" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block4" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block5" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block6" })).hasInlineInputs).toBe(true);
	expect((await getBlock(page, { id: "block7" })).hasInlineInputs).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Disable Block (2)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block2" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block3" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block4" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block5" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block6" })).isEnabled).toBe(false);
	expect((await getBlock(page, { id: "block7" })).isEnabled).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
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
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block5" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block6" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Enable Block (3)" })
			.click(),
	);

	expect((await getBlock(page, { id: "block1" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block2" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block3" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block4" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block5" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block6" })).isEnabled).toBe(true);
	expect((await getBlock(page, { id: "block7" })).isEnabled).toBe(true);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block2",
		"block3",
		"block4",
		"block5",
		"block6",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("edit block comment", async ({ page, act }) => {
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
			{ type: "math_number", id: "block3" },
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

	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
	await act(page.locator(".blocklyTextarea").click());
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
	expect(await isEphemeralFocusTaken(page)).toBe(false);
	await act(page.keyboard.type("hello"));
	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("edit block mutator", async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "procedures_defreturn", id: "block1" },
			{ type: "procedures_defreturn", id: "block2" },
			{ type: "math_number", id: "block3" },
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

	await act(page.locator(`g[data-id="block1"] .blocklyMutatorIcon`).click());
	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
	await act(page.locator(".blocklyCheckboxField").click());
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).not.toBeNull();
	expect(await isEphemeralFocusTaken(page)).toBe(false);
	await act(page.locator(`g[data-id="block1"] .blocklyMutatorIcon`).click());

	expect(await getHighlightedBlockIds(page)).toEqual(["block1", "block2"]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});
