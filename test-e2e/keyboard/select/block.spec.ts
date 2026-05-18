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

test("navigate left", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowLeft"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getFocusedField(page)).toEqual({
		blockId: "block1",
		name: "BOOL",
	});
});

test("navigate right", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowRight"));

	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getFocusedField(page)).toEqual({
		blockId: "block2",
		name: "NUM",
	});
});

test("unconstrained move via shortcut", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

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

test("abort unconstrained move via shortcut", async ({ page, act }) => {
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	expect(block2BoundsEnd.left).toBeCloseTo(block2BoundsStart.left);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("unconstrained move via context menu", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

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

test("abort unconstrained move via context menu", async ({ page, act }) => {
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	expect(block2BoundsEnd.left).toBeCloseTo(block2BoundsStart.left);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["block2"]);
	expect(await getSelectedId(page)).toBe("block2");
});

test("open context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));

	await expect(page.getByRole("menu")).toBeVisible();
	const expectedMenuItems: [string, boolean][] = [
		["Duplicate D", true],
		["Add Comment", true],
		["Collapse Block", true],
		["Disable Block", true],
		["Delete Block Delete", true],
		["Help", true],
		["Move Block M", true],
		["Edit Block contents Right", true],
		[`Cut ${cmdOrCtrlLabel("X")}`, true],
		[`Copy ${cmdOrCtrlLabel("C")}`, true],
		[`Paste ${cmdOrCtrlLabel("V")}`, true],
		["Copy to Backpack", true],
	];
	expect(await page.getByRole("menuitem").allTextContents()).toEqual(
		expectedMenuItems.map(([name]) => name),
	);
	for (const [name, enabled] of expectedMenuItems) {
		const menuItem = page.getByRole("menuitem", { exact: true, name });
		if (enabled) {
			await expect(menuItem).toBeEnabled();
		} else {
			await expect(menuItem).toBeDisabled();
		}
	}
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("block2");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
});
