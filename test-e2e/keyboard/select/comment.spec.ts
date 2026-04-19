import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	cmdOrCtrlLabel,
	getComment,
	getFocusedCommentButton,
	getGridSpacing,
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

test("constrained move via shortcut", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const comment3BoundsStart = (await getComment(page, "comment3")).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	const comment3BoundsEnd = (await getComment(page, "comment3")).bounds;
	expect(comment2BoundsEnd.left).toBeCloseTo(
		comment2BoundsStart.left + gridSpacing,
	);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment1BoundsEnd.left).toBeCloseTo(comment1BoundsStart.left);
	expect(comment1BoundsEnd.top).toBeCloseTo(comment1BoundsStart.top);
	expect(comment3BoundsEnd.left).toBeCloseTo(comment3BoundsStart.left);
	expect(comment3BoundsEnd.top).toBeCloseTo(comment3BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("abort constrained move via shortcut", async ({ page, act }) => {
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("constrained move via context menu", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const comment3BoundsStart = (await getComment(page, "comment3")).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 2; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	const comment3BoundsEnd = (await getComment(page, "comment3")).bounds;
	expect(comment2BoundsEnd.left).toBeCloseTo(
		comment2BoundsStart.left + gridSpacing,
	);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment1BoundsEnd.left).toBeCloseTo(comment1BoundsStart.left);
	expect(comment1BoundsEnd.top).toBeCloseTo(comment1BoundsStart.top);
	expect(comment3BoundsEnd.left).toBeCloseTo(comment3BoundsStart.left);
	expect(comment3BoundsEnd.top).toBeCloseTo(comment3BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("abort constrained move via context menu", async ({ page, act }) => {
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 2; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("unconstrained move via shortcut", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const comment3BoundsStart = (await getComment(page, "comment3")).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	const comment3BoundsEnd = (await getComment(page, "comment3")).bounds;
	expect(comment2BoundsEnd.left).toBeCloseTo(
		comment2BoundsStart.left + gridSpacing,
	);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment1BoundsEnd.left).toBeCloseTo(comment1BoundsStart.left);
	expect(comment1BoundsEnd.top).toBeCloseTo(comment1BoundsStart.top);
	expect(comment3BoundsEnd.left).toBeCloseTo(comment3BoundsStart.left);
	expect(comment3BoundsEnd.top).toBeCloseTo(comment3BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("abort unconstrained move via shortcut", async ({ page, act }) => {
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("unconstrained move via context menu", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const comment3BoundsStart = (await getComment(page, "comment3")).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 2; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	const comment3BoundsEnd = (await getComment(page, "comment3")).bounds;
	expect(comment2BoundsEnd.left).toBeCloseTo(
		comment2BoundsStart.left + gridSpacing,
	);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment1BoundsEnd.left).toBeCloseTo(comment1BoundsStart.left);
	expect(comment1BoundsEnd.top).toBeCloseTo(comment1BoundsStart.top);
	expect(comment3BoundsEnd.left).toBeCloseTo(comment3BoundsStart.left);
	expect(comment3BoundsEnd.top).toBeCloseTo(comment3BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("abort unconstrained move via context menu", async ({ page, act }) => {
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 2; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("Alt+ArrowRight"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
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
