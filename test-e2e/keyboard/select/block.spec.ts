import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getBlock,
	getFocusedField,
	getGridSpacing,
	getHighlightedBlockIds,
	getSelectedId,
	isEphemeralFocusTaken,
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

test("navigate right and left", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowRight"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getFocusedField(page)).toEqual({
		blockId: "block2",
		name: "NUM",
	});

	await act(page.keyboard.press("ArrowLeft"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("unconstrained move", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicator")).toBeVisible();
	await act(page.keyboard.press(cmdOrCtrl("ArrowRight")));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicator")).not.toBeVisible();

	const block1BoundsEnd = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsEnd = (await getBlock(page, { id: "block3" })).bounds;
	expect(block2BoundsEnd.left).toBeCloseTo(
		block2BoundsStart.left + gridSpacing,
	);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(block1BoundsEnd.left).toBeCloseTo(block1BoundsStart.left);
	expect(block1BoundsEnd.top).toBeCloseTo(block1BoundsStart.top);
	expect(block3BoundsEnd.left).toBeCloseTo(block3BoundsStart.left);
	expect(block3BoundsEnd.top).toBeCloseTo(block3BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("abort unconstrained move", async ({ page, act }) => {
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicator")).toBeVisible();
	await act(page.keyboard.press(cmdOrCtrl("ArrowRight")));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicator")).not.toBeVisible();

	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	expect(block2BoundsEnd.left).toBeCloseTo(block2BoundsStart.left);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("open context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));

	await expect(page.getByRole("menu")).toBeVisible();
	await expect(page.getByRole("menu")).toMatchAriaSnapshot(`
		- menu:
		  - menuitem "Copy ${cmdOrCtrlLabel("C")}"
		  - menuitem "Duplicate D"
		  - menuitem "Add Comment"
		  - menuitem "Collapse Block"
		  - menuitem "Disable Block"
		  - menuitem "Delete Block Delete"
		  - menuitem "Help"
		  - menuitem "Copy to Backpack"
	`);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block2");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
});
