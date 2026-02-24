import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getBlock,
	getBlockBounds,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "./test";

test("select all", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
	]);

	await act(page.keyboard.press("Control+A"));

	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("duplicate", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlock(page, "block1")), {
		button: "right",
	});
	await act(page.getByRole("menuitem", { name: "Duplicate (2)" }).click());

	expect(await getAllBlockIds(page)).toHaveLength(5);
	const selectedBlockIds = await getSelectedBlockIds(page);
	expect(selectedBlockIds).toHaveLength(2);
	expect(selectedBlockIds).not.toContain("block1");
	expect(selectedBlockIds).not.toContain("block2");
	expect(selectedBlockIds).not.toContain("block3");
});

test("copy and paste", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.keyboard.press("Control+C");
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

test("cut and paste", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await act(page.keyboard.press("Control+X"));
	expect(await getAllBlockIds(page)).toEqual(["block3"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllBlockIds(page)).toEqual(["block1", "block2", "block3"]);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});

test("delete", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await act(page.keyboard.press("Delete"));

	expect(await getAllBlockIds(page)).toEqual(["block3"]);
	expect(await getSelectedBlockIds(page)).toEqual([]);
});

test("undo", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");
	await act(page.keyboard.press("Delete"));

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllBlockIds(page)).toEqual(["block1", "block2"]);
});

test("redo", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");
	await act(page.keyboard.press("Delete"));
	await act(page.keyboard.press("Control+Z"));

	await act(page.keyboard.press("Control+Shift+Z"));

	expect(await getAllBlockIds(page)).toEqual([]);
});

test("dragging moves selected blocks together", async ({ page, act }) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");
	const block1BoundsStart = await getBlockBounds(page, "block1");
	const block2BoundsStart = await getBlockBounds(page, "block2");
	const block3BoundsStart = await getBlockBounds(page, "block3");

	await page.mouse.move(...(await getBlock(page, "block1")));
	await page.mouse.down();
	await page.mouse.move(
		block1BoundsStart.left + 100,
		block1BoundsStart.top + 100,
	);
	await act(page.mouse.up());

	const block1BoundsEnd = await getBlockBounds(page, "block1");
	const block2BoundsEnd = await getBlockBounds(page, "block2");
	const block3BoundsEnd = await getBlockBounds(page, "block3");
	expect(block1BoundsEnd.left - block1BoundsStart.left).toEqual(
		block2BoundsEnd.left - block2BoundsStart.left,
	);
	expect(block1BoundsEnd.top - block1BoundsStart.top).toEqual(
		block2BoundsEnd.top - block2BoundsStart.top,
	);
	expect(block3BoundsEnd.left).toBeCloseTo(block3BoundsStart.left);
	expect(block3BoundsEnd.top).toBeCloseTo(block3BoundsStart.top);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});
