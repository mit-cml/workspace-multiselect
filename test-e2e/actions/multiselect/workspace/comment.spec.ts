import { expect } from "@playwright/test";
import {
	getAllCommentIds,
	getComment,
	getEmptySpace,
	getGridSpacing,
	getHighlightedCommentIds,
	getMultiselectDraggableId,
	getSelectedId,
	getTrash,
	loadComments,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadComments(page, [
			{ id: "comment1" },
			{ id: "comment2" },
			{ id: "comment3" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);
	await act(
		page.mouse.click(...(await getComment(page, "comment2")).centerTop),
	);
	await act(page.keyboard.up("Shift"));
});

test("duplicate comments via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: "Duplicate Comment (2)",
			})
			.click(),
	);

	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(5);
	const newCommentIds = allCommentIds.filter(
		(id) => !["comment1", "comment2", "comment3"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(newCommentIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste comments via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+C"));
	expect(await getAllCommentIds(page)).toEqual([
		"comment1",
		"comment2",
		"comment3",
	]);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(page.keyboard.press("Control+V"));
	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(5);
	const newCommentIds = allCommentIds.filter(
		(id) => !["comment1", "comment2", "comment3"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(newCommentIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("copy and paste comments via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page.getByRole("menuitem", { exact: true, name: "Copy (2)" }).click(),
	);
	expect(await getAllCommentIds(page)).toEqual([
		"comment1",
		"comment2",
		"comment3",
	]);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(
		page.getByRole("menuitem", { exact: true, name: "Paste (2)" }).click(),
	);
	const allCommentIds = await getAllCommentIds(page);
	expect(allCommentIds).toHaveLength(5);
	const newCommentIds = allCommentIds.filter(
		(id) => !["comment1", "comment2", "comment3"].includes(id),
	);
	expect(await getHighlightedCommentIds(page)).toEqual(newCommentIds);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("cut and paste comments via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Control+X"));
	expect(await getAllCommentIds(page)).toEqual(["comment3"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();

	await act(page.keyboard.press("Control+V"));
	expect(await getAllCommentIds(page)).toHaveLength(3);
	const highlightedCommentIds = await getHighlightedCommentIds(page);
	expect(highlightedCommentIds).toHaveLength(2);
	expect(highlightedCommentIds).not.toContain("comment3");
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});

test("delete comments via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllCommentIds(page)).toEqual(["comment3"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("delete comments via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop, {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(
		page
			.getByRole("menuitem", {
				exact: true,
				name: "Remove Comment (2)",
			})
			.click(),
	);

	expect(await getAllCommentIds(page)).toEqual(["comment3"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("drag comments to trash", async ({ page, act }) => {
	await act(page.mouse.move(...(await getComment(page, "comment1")).centerTop));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getTrash(page))));
	await act(page.mouse.up());

	expect(await getAllCommentIds(page)).toEqual(["comment3"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("undo via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllCommentIds(page)).toEqual(["comment3"]);

	await act(page.keyboard.press("Control+Z"));

	expect(await getAllCommentIds(page)).toEqual([
		"comment1",
		"comment2",
		"comment3",
	]);
});

test("undo via context menu", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));
	expect(await getAllCommentIds(page)).toEqual(["comment3"]);

	await act(
		page.mouse.click(...(await getEmptySpace(page)), {
			button: "right",
		}),
	);
	await act(page.getByRole("menuitem", { exact: true, name: "Undo" }).click());

	expect(await getAllCommentIds(page)).toEqual([
		"comment1",
		"comment2",
		"comment3",
	]);
});

test("drag comments", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;
	const comment1BoundsStart = (await getComment(page, "comment1")).bounds;
	const comment2BoundsStart = (await getComment(page, "comment2")).bounds;
	const comment3BoundsStart = (await getComment(page, "comment3")).bounds;
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
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(page.mouse.up());

	const comment1BoundsEnd = (await getComment(page, "comment1")).bounds;
	const comment2BoundsEnd = (await getComment(page, "comment2")).bounds;
	const comment3BoundsEnd = (await getComment(page, "comment3")).bounds;
	expect(comment1BoundsEnd.left - comment1BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(comment1BoundsEnd.top - comment1BoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	expect(comment2BoundsEnd.left - comment2BoundsStart.left).toBeCloseTo(
		gridSpacing,
	);
	expect(comment2BoundsEnd.top - comment2BoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	expect(comment3BoundsEnd.left).toBeCloseTo(comment3BoundsStart.left);
	expect(comment3BoundsEnd.top).toBeCloseTo(comment3BoundsStart.top);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
});
