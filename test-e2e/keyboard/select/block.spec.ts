import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getBlock,
	getFocusedField,
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
