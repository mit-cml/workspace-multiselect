import { expect } from "@playwright/test";
import { cmdOrCtrl, getEmptySpace, loadBlocks, test } from "../test";

test.beforeEach(async ({ page, act }) => {
	await act(loadBlocks(page, [{ type: "logic_boolean", id: "block1" }]));
});

test("workspace context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getEmptySpace(page)), { button: "right" }),
	);
	await expect(page.getByRole("menu")).toBeVisible();
	const rightClickMenuItems = await page
		.getByRole("menuitem")
		.allTextContents();
	await act(page.keyboard.press("Escape"));

	await act(page.keyboard.press("W"));
	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	await expect(page.getByRole("menu")).toBeVisible();
	const keyboardMenuItems = await page.getByRole("menuitem").allTextContents();

	expect(keyboardMenuItems).toEqual(rightClickMenuItems);
});
