import { expect } from "@playwright/test";
import { getBlock, isMultiselectEnabled, loadBlocks, test } from "../../test";

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
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.BOOL.center,
		),
	);

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while field dropdown is open disables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "logic_boolean", id: "block1" }]));
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.BOOL.center,
		),
	);
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while editing field text enables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.NUM.center,
		),
	);

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while editing field text disables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "math_number", id: "block1" }]));
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "block1" })).fields.NUM.center,
		),
	);
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while comment is open enables multiselect", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_number",
				id: "block1",
				icons: { comment: { text: "" } },
			},
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while comment is open disables multiselect", async ({
	page,
	act,
}) => {
	await act(
		loadBlocks(page, [
			{
				type: "math_number",
				id: "block1",
				icons: { comment: { text: "" } },
			},
		]),
	);
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.locator(`g[data-id="block1"] .blocklyIconGroup`).click());
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while mutator is open enables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "procedures_defreturn", id: "block1" }]));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.locator(`g[data-id="block1"] .blockly-icon-mutator`).click());

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while mutator is open disables multiselect", async ({
	page,
	act,
}) => {
	await act(loadBlocks(page, [{ type: "procedures_defreturn", id: "block1" }]));
	await act(
		page.mouse.click(...(await getBlock(page, { id: "block1" })).centerTop),
	);
	await act(page.locator(`g[data-id="block1"] .blockly-icon-mutator`).click());
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("pressing shift while toolbox is open enables multiselect", async ({
	page,
	act,
}) => {
	await act(page.getByRole("treeitem", { name: "Logic" }).click());

	await act(page.keyboard.down("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(true);
});

test("releasing shift while toolbox is open disables multiselect", async ({
	page,
	act,
}) => {
	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("multiselect enabled by icon is disabled when releasing shift", async ({
	page,
	act,
}) => {
	await act(page.locator(".blocklyMultiselect image").click());
	await act(page.keyboard.down("Shift"));

	await act(page.keyboard.up("Shift"));

	expect(await isMultiselectEnabled(page)).toBe(false);
});

test("multiselect is disabled when leaving workspace", async ({
	page,
	act,
}) => {
	await act(page.keyboard.down("Shift"));

	await act(page.getByText("Blockly Playground").click());

	expect(await isMultiselectEnabled(page)).toBe(false);
});
