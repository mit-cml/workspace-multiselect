import { expect } from "@playwright/test";
import {
	getBlock,
	getBlockField,
	getBlockFieldValue,
	getSelectedBlockIds,
	loadBlocks,
	test,
} from "../test";

test("editing field updates all selected same-type blocks", async ({
	page,
	act,
}) => {
	await loadBlocks(page, [
		{ type: "math_number", id: "block1" },
		{ type: "math_number", id: "block2" },
		{ type: "math_number", id: "block3" },
	]);
	await page.keyboard.down("Shift");
	await act(page.mouse.click(...(await getBlock(page, "block1"))));
	await act(page.mouse.click(...(await getBlock(page, "block2"))));
	await page.keyboard.up("Shift");

	await page.mouse.click(...(await getBlockField(page, "block1", "NUM")));
	await page.keyboard.type("42");
	await act(page.keyboard.press("Enter"));

	expect(await getBlockFieldValue(page, "block1", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block2", "NUM")).toBe(42);
	expect(await getBlockFieldValue(page, "block3", "NUM")).toBe(0);
	expect(await getSelectedBlockIds(page)).toEqual(["block1", "block2"]);
});
