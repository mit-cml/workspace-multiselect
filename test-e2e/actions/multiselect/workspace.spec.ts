import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getBlock,
	getBlockBounds,
	getEmptySpace,
	getGridSpacing,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "block1" },
			{ type: "math_number", id: "block2" },
			{ type: "math_number", id: "block3" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await act(page.keyboard.up("Shift"));
});

test("duplicate blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Duplicate (2)" }).click(),
	);

	expect(await getAllBlockIds(page)).toHaveLength(5);
	const selectedBlockIds = await getSelectedBlockIds(page);
	expect(selectedBlockIds).toHaveLength(2);
	expect(selectedBlockIds).not.toContain("block1");
	expect(selectedBlockIds).not.toContain("block2");
	expect(selectedBlockIds).not.toContain("block3");
});

test("copy and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toHaveLength(5);
	const selectedBlockIds = await getSelectedBlockIds(page);
	expect(selectedBlockIds).toHaveLength(2);
	expect(selectedBlockIds).not.toContain("block1");
	expect(selectedBlockIds).not.toContain("block2");
	expect(selectedBlockIds).not.toContain("block3");
});

test("copy and paste blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Copy (2)" }).click(),
	);
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Paste (2)" }).click(),
	);
	expect(await getAllBlockIds(page)).toHaveLength(5);
	const selectedBlockIds = await getSelectedBlockIds(page);
	expect(selectedBlockIds).toHaveLength(2);
	expect(selectedBlockIds).not.toContain("block1");
	expect(selectedBlockIds).not.toContain("block2");
	expect(selectedBlockIds).not.toContain("block3");
});

test("cut and paste blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("delete blocks via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("delete blocks via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getBlock(page, "block1")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Delete 2 Blocks" })
			.click(),
	);

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
});

test("drag blocks", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const block1BoundsStart = await getBlockBounds(page, "block1");
	const block2BoundsStart = await getBlockBounds(page, "block2");
	const block3BoundsStart = await getBlockBounds(page, "block3");
	const [block1X, block1Y] = await getBlock(page, "block1");

	await act(page.mouse.move(block1X, block1Y));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			block1X + halfGridSpacing + 1,
			block1Y + halfGridSpacing + 1,
		),
	);
	await act(page.mouse.up());

	const block1BoundsEnd = await getBlockBounds(page, "block1");
	const block2BoundsEnd = await getBlockBounds(page, "block2");
	const block3BoundsEnd = await getBlockBounds(page, "block3");
	expect(block1BoundsEnd.left - block1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block1BoundsEnd.top - block1BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block2BoundsEnd.left - block2BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(block2BoundsEnd.top - block2BoundsStart.top).toBeCloseTo(gridSpacing);
	expect(block3BoundsEnd.left).toBeCloseTo(block3BoundsStart.left);
	expect(block3BoundsEnd.top).toBeCloseTo(block3BoundsStart.top);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});
