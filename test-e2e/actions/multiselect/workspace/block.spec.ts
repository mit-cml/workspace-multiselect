import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getAllBlockIds,
	getBackpack,
	getBlock,
	getEmptySpace,
	getGridSpacing,
	getHighlightedBlockIds,
	getMultiselectDraggableId,
	getSelectedId,
	getTrash,
	isEphemeralFocusTaken,
	loadBlocks,
	openBackpack,
	openTrash,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "logic_boolean", id: "block1" },
			{
				type: "math_arithmetic",
				id: "block2",
				inputs: {
					A: { block: { type: "math_number", id: "block2-child" } },
				},
			},
			{
				type: "logic_compare",
				id: "block3",
				inputs: {
					A: { block: { type: "logic_boolean", id: "block3-child" } },
				},
			},
			{ type: "logic_boolean", id: "block4" },
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
		page.mouse.click(
			...(await getBlock(page, { id: "block2-child" })).centerTop,
		),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block3" })).centerTop),
	);
	await act(page.keyboard.up("Shift"));
});

test("open context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);

	await expect(page.getByRole("menu")).toBeVisible();
	const expectedMenuItems: [string, boolean][] = [
		["Duplicate (3) D", true],
		["Add Comment (4)", true],
		["Collapse Block (3)", true],
		["Disable Block (3)", true],
		["Delete 5 Blocks Delete", true],
		["Help", true],
		[`Cut (3) ${cmdOrCtrlLabel("X")}`, true],
		[`Copy (3) ${cmdOrCtrlLabel("C")}`, true],
		[`Paste ${cmdOrCtrlLabel("V")}`, true],
		["Copy to Backpack (3)", true],
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

test("duplicate blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Duplicate (3) D" })
			.click(),
	);

	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(11);
	const newBlockIds = allBlockIds.filter(
		(id) =>
			![
				"block1",
				"block2",
				"block2-child",
				"block3",
				"block3-child",
				"block4",
			].includes(id),
	);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(newBlockIds).toHaveLength(5);
	expect(highlightedBlockIds).toHaveLength(3);
	expect(newBlockIds).toEqual(expect.arrayContaining(highlightedBlockIds));
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("copy and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("C")));
	expect(await getAllBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
		"block3-child",
		"block4",
	]);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(
		page.mouse.click(...(await getBlock(page, { id: "block4" })).centerTop),
	);
	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");
	await act(page.locator(".blocklyMultiselect image").click());

	await act(page.keyboard.press(cmdOrCtrl("V")));
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(11);
	const newBlockIds = allBlockIds.filter(
		(id) =>
			![
				"block1",
				"block2",
				"block2-child",
				"block3",
				"block3-child",
				"block4",
			].includes(id),
	);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(newBlockIds).toHaveLength(5);
	expect(highlightedBlockIds).toHaveLength(3);
	expect(newBlockIds).toEqual(expect.arrayContaining(highlightedBlockIds));
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: `Copy (3) ${cmdOrCtrlLabel("C")}`,
			})
			.click(),
	);
	expect(await getAllBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
		"block3-child",
		"block4",
	]);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: `Paste (3) ${cmdOrCtrlLabel("V")}`,
			})
			.click(),
	);
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(11);
	const newBlockIds = allBlockIds.filter(
		(id) =>
			![
				"block1",
				"block2",
				"block2-child",
				"block3",
				"block3-child",
				"block4",
			].includes(id),
	);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(newBlockIds).toHaveLength(5);
	expect(highlightedBlockIds).toHaveLength(3);
	expect(newBlockIds).toEqual(expect.arrayContaining(highlightedBlockIds));
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("cut and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("X")));
	expect(await getAllBlockIds(page)).toEqual(["block4"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");

	await act(page.keyboard.press(cmdOrCtrl("V")));
	expect(await getAllBlockIds(page)).toHaveLength(6);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(highlightedBlockIds).toHaveLength(3);
	expect(highlightedBlockIds).not.toContain("block4");
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("cut and paste blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: `Cut (3) ${cmdOrCtrlLabel("X")}`,
			})
			.click(),
	);
	expect(await getAllBlockIds(page)).toEqual(["block4"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: `Paste (3) ${cmdOrCtrlLabel("V")}`,
			})
			.click(),
	);
	expect(await getAllBlockIds(page)).toHaveLength(6);
	const highlightedBlockIds = await getHighlightedBlockIds(page);
	expect(highlightedBlockIds).toHaveLength(3);
	expect(highlightedBlockIds).not.toContain("block4");
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("delete blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block4"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");
});

test("delete blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Delete 5 Blocks Delete" })
			.click(),
	);

	expect(await getAllBlockIds(page)).toEqual(["block4"]);
	expect(await getHighlightedBlockIds(page)).toEqual(["block4"]);
	expect(await getSelectedId(page)).toBe("block4");
	expect(await isEphemeralFocusTaken(page)).toBe(false);
});

test("drag blocks to trash", async ({ page, act }) => {
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getTrash(page))));
	await act(page.mouse.up());

	expect(await getAllBlockIds(page)).toEqual(["block4"]);
	expect(await getHighlightedBlockIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await openTrash(page);
	await getBlock(page, { type: "logic_boolean", workspace: "trash" });
	await getBlock(page, { type: "math_arithmetic", workspace: "trash" });
	await getBlock(page, { type: "logic_compare", workspace: "trash" });
});

test("drag blocks to backpack", async ({ page, act }) => {
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;
	await act(
		page.mouse.move(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getBackpack(page))));
	await act(page.mouse.up());

	expect(await getAllBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
		"block3-child",
		"block4",
	]);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	const block1BoundsEnd = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsEnd = (await getBlock(page, { id: "block3" })).bounds;
	expect(block1BoundsEnd.left).toBeCloseTo(block1BoundsStart.left);
	expect(block1BoundsEnd.top).toBeCloseTo(block1BoundsStart.top);
	expect(block2BoundsEnd.left).toBeCloseTo(block2BoundsStart.left);
	expect(block2BoundsEnd.top).toBeCloseTo(block2BoundsStart.top);
	expect(block3BoundsEnd.left).toBeCloseTo(block3BoundsStart.left);
	expect(block3BoundsEnd.top).toBeCloseTo(block3BoundsStart.top);

	await openBackpack(page);
	await getBlock(page, { type: "logic_boolean", workspace: "backpack" });
	await getBlock(page, { type: "math_arithmetic", workspace: "backpack" });
	await getBlock(page, { type: "logic_compare", workspace: "backpack" });
	await expect(
		getBlock(page, { type: "math_number", workspace: "backpack" }),
	).rejects.toThrow('Block type "math_number" not found');
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block4"]);

	await act(page.keyboard.press(cmdOrCtrl("Z")));

	expect(await getAllBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
		"block3-child",
		"block4",
	]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block4"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
		"block3-child",
		"block4",
	]);
});

test("drag blocks", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const block1BoundsStart = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsStart = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsStart = (await getBlock(page, { id: "block3" })).bounds;
	const block4BoundsStart = (await getBlock(page, { id: "block4" })).bounds;
	const [block1Center, block1Top] = (await getBlock(page, { id: "block1" }))
		.centerTop;

	await act(page.mouse.move(block1Center, block1Top));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block1Center + halfGridSpacing + 1,
			block1Top + halfGridSpacing + 1,
		),
	);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(page.mouse.up());

	const block1BoundsEnd = (await getBlock(page, { id: "block1" })).bounds;
	const block2BoundsEnd = (await getBlock(page, { id: "block2" })).bounds;
	const block3BoundsEnd = (await getBlock(page, { id: "block3" })).bounds;
	const block4BoundsEnd = (await getBlock(page, { id: "block4" })).bounds;
	expect(block1BoundsEnd.left - block1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block1BoundsEnd.top - block1BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block2BoundsEnd.left - block2BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block2BoundsEnd.top - block2BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block3BoundsEnd.left - block3BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block3BoundsEnd.top - block3BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block4BoundsEnd.left).toBeCloseTo(block4BoundsStart.left);
	expect(block4BoundsEnd.top).toBeCloseTo(block4BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual([
		"block1",
		"block2",
		"block2-child",
		"block3",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});
