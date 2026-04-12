import { expect } from "@playwright/test";
import {
	getAllCommentIds,
	getComment,
	getEmptySpace,
	getGridSpacing,
	getHighlightedCommentIds,
	getSelectedId,
	getTrash,
	loadComments,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);
});

test("duplicate comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
	await act(
		page
			.getByRole("menuitem", { exact: true, name: "Duplicate Comment" })
			.click(),
	);

	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(3);
	const [newCommentId] = allCommentIds.filter(
		(id) => !["comment1", "comment2"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([newCommentId]);
	expect(await getSelectedId(page)).toBe(newCommentId);
});

test("copy and paste comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");

	await act(page.keyboard.press("Control+V"));
	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(3);
	const [newCommentId] = allCommentIds.filter(
		(id) => !["comment1", "comment2"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([newCommentId]);
	expect(await getSelectedId(page)).toBe(newCommentId);
});

test("copy and paste comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
	await act(page.getByRole("menuitem", { exact: true, name: "Copy" }).click());
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Paste" }).click());
	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(3);
	const [newCommentId] = allCommentIds.filter(
		(id) => !["comment1", "comment2"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([newCommentId]);
	expect(await getSelectedId(page)).toBe(newCommentId);
});

test("cut and paste comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllCommentIds(page)).toEqual(["comment2"]);

	await act(page.keyboard.press("Control+V"));
	expect(await getAllCommentIds(page)).toEqual(["comment1", "comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});

test("delete comment via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllCommentIds(page)).toEqual(["comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("delete comment via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
	await act(
		page.getByRole("menuitem", { exact: true, name: "Remove Comment" }).click(),
	);

	expect(await getAllCommentIds(page)).toEqual(["comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("drag comment to trash", async ({ page, act }) => {
	await act(page.mouse.move(...(await getComment(page, "comment1")).centerTop));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getTrash(page))));
	await act(page.mouse.up());

	expect(await getAllCommentIds(page)).toEqual(["comment2"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe("comment1");
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
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const [comment1Center, comment1Top] = (await getComment(page, "comment1"))
		.centerTop;

	await act(page.mouse.move(comment1Center, comment1Top));
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			comment1Center + halfGridSpacing + 1,
			comment1Top + halfGridSpacing + 1,
		),
	);
	await act(page.mouse.up());

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	expect(comment1BoundsEnd.left - comment1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(comment1BoundsEnd.top - comment1BoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	expect(comment2BoundsEnd.left).toBeCloseTo(comment2BoundsStart.left);
	expect(comment2BoundsEnd.top).toBeCloseTo(comment2BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});
