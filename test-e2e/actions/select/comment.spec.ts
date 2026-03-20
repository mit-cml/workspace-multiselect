import { expect } from "@playwright/test";
import {
	getAllCommentIds,
	getComment,
	getCommentBounds,
	getEmptySpace,
	getGridSpacing,
	getSelectedCommentIds,
	loadComments,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
});

test("duplicate comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Duplicate Comment" })
			.click(),
	);

	expect(await getAllCommentIds(page)).toHaveLength(3);
	const selectedCommentIds = await getSelectedCommentIds(page);
	expect(selectedCommentIds).toHaveLength(1);
	expect(selectedCommentIds).not.toContain("comment1");
	expect(selectedCommentIds).not.toContain("comment2");
});

test("copy and paste comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllCommentIds(page)).toHaveLength(3);
	const selectedCommentIds = await getSelectedCommentIds(page);
	expect(selectedCommentIds).toHaveLength(1);
	expect(selectedCommentIds).not.toContain("comment1");
	expect(selectedCommentIds).not.toContain("comment2");
});

test("copy and paste comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Copy" }).click());
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Paste" }).click());
	expect(await getAllCommentIds(page)).toHaveLength(3);
	const selectedCommentIds = await getSelectedCommentIds(page);
	expect(selectedCommentIds).toHaveLength(1);
	expect(selectedCommentIds).not.toContain("comment1");
	expect(selectedCommentIds).not.toContain("comment2");
});

test("cut and paste comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllCommentIds(page)).toEqual(["comment2"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);
});

test("delete comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedCommentIds(page)).toEqual([]);
});

test("delete comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Remove Comment" }).click(),
	);

	expect(await getAllCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedCommentIds(page)).toEqual([]);
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllCommentIds(page)).toEqual(["comment2"]);

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllCommentIds(page)).toEqual(["comment2"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("drag comment", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const comment1BoundsStart = await getCommentBounds(page, "comment1");
	const comment2BoundsStart = await getCommentBounds(page, "comment2");
	const [comment1X, comment1Y] = await getComment(page, "comment1");

	await act(page.mouse.move(comment1X, comment1Y));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			comment1X + halfGridSpacing + 1,
			comment1Y + halfGridSpacing + 1,
		),
	);
	await act(page.mouse.up());

	const comment1BoundsEnd = await getCommentBounds(page, "comment1");
	const comment2BoundsEnd = await getCommentBounds(page, "comment2");
	expect(comment1BoundsEnd.left - comment1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(comment1BoundsEnd.top - comment1BoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);
});
