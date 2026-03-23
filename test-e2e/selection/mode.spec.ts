import { expect } from "@playwright/test";
import {
	getBlockField,
	getMultiselectIcon,
	isMultiselectEnabled,
	loadBlocks,
	test,
} from "../test";

test("pressing shift in workspace enables multiselect", async ({
	page,
	act,
}) => {
	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift in workspace disables multiselect", async ({
	page,
	act,
}) => {
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while field dropdown is open enables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "logic_boolean", id: "block1" }]));
	await act(page.mouse.click(...(await getBlockField(page, "block1", "BOOL"))));

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while field dropdown is open disables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "logic_boolean", id: "block1" }]));
	await act(page.mouse.click(...(await getBlockField(page, "block1", "BOOL"))));
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while editing field text enables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlockField(page, "block1", "NUM"))));

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while editing field text disables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(page.mouse.click(...(await getBlockField(page, "block1", "NUM"))));
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("multiselect enabled by icon is disabled when releasing shift", async ({
	page,
	act,
}) => {
	await act(page.mouse.click(...(await getMultiselectIcon(page))));
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("multiselect is disabled when leaving workspace", async ({
	page,
	act,
}) => {
	await act(page.keyboard.down("Shift"));

	await page.getByText("Blockly Playground").click();

	expect(await isMultiselectEnabled(page)).toBe(false);
});
