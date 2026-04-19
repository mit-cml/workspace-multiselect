import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getBlock,
	getFocusedField,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	isEphemeralFocusTaken,
	loadBlocks,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{ type: "logic_boolean", id: "block2" },
			{ type: "math_number", id: "block3" },
			{ type: "math_number", id: "block4" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block2" })).centerTop),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));
});

test("navigate up", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block1"]);
	expect(await getSelectedId(page)).toBe("block1");
});

test("navigate down", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");
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

	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");
});

test("open context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));

	await expect(page.getByRole("menu")).toBeVisible();
	const expectedMenuItems: [string, boolean][] = [
		["Duplicate (2) D", true],
		["Add Comment (2)", true],
		["Collapse Block (2)", true],
		["Disable Block (2)", true],
		["Delete 2 Blocks Delete", true],
		["Help", true],
		["Move Block M", false],
		[`Cut (2) ${cmdOrCtrlLabel("X")}`, true],
		[`Copy (2) ${cmdOrCtrlLabel("C")}`, true],
		[`Paste ${cmdOrCtrlLabel("V")}`, true],
		["Copy to Backpack (2)", true],
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
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
});
