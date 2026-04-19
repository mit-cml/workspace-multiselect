import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getComment,
	getFocusedCommentButton,
	getHighlightedCommentIds,
	getMultiselectDraggableId,
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
			{ id: "comment4" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getComment(page, "comment2")).centerTop),
	);
	await act(
		page.mouse.click(...(await getComment(page, "comment3")).centerTop),
	);
	await act(page.keyboard.up("Shift"));
});

test("navigate up", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});

test("navigate down", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedCommentIds(page)).toEqual(["comment4"]);
	expect(await getSelectedId(page)).toBe("comment4");
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

	expect(await getHighlightedCommentIds(page)).toEqual(["comment4"]);
	expect(await getSelectedId(page)).toBe("comment4");
});

test("open context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));

	await expect(page.getByRole("menu")).toBeVisible();
	const expectedMenuItems: [string, boolean][] = [
		["Duplicate Comment (2) D", true],
		["Remove Comment (2)", true],
		["Move Comment M", true],
		[`Cut (2) ${cmdOrCtrlLabel("X")}`, true],
		[`Copy (2) ${cmdOrCtrlLabel("C")}`, true],
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
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	expect(await isEphemeralFocusTaken(page)).toBe(true);
});
