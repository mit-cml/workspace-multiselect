import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getComment,
	getFocusedCommentButton,
	getHighlightedCommentIds,
	getSelectedId,
	isEphemeralFocusTaken,
	loadComments,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadComments(page, [
			{ id: "comment1" },
			{ id: "comment2" },
			{ id: "comment3" },
		]),
	);
	await act(
		page.mouse.click(...(await getComment(page, "comment2")).centerTop),
	);
});

test("navigate up", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});

test("navigate down", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedCommentIds(page)).toEqual(["comment3"]);
	expect(await getSelectedId(page)).toBe("comment3");
});

test("navigate left", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowLeft"));

	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getFocusedCommentButton(page)).toEqual({
		commentId: "comment1",
		type: "delete",
	});
});

test("navigate right", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowRight"));

	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getFocusedCommentButton(page)).toEqual({
		commentId: "comment2",
		type: "collapse",
	});
});

test("open context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));

	await expect(page.getByRole("menu")).toBeVisible();
	const expectedMenuItems: [string, boolean][] = [
		["Duplicate Comment D", true],
		["Remove Comment", true],
		["Move Comment M", true],
		[`Cut ${cmdOrCtrlLabel("X")}`, true],
		[`Copy ${cmdOrCtrlLabel("C")}`, true],
		[`Paste ${cmdOrCtrlLabel("V")}`, true],
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
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("comment2");
	expect(await isEphemeralFocusTaken(page)).toBe(true);
});
