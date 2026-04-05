import { expect } from "@playwright/test";
import {
	getAllBlockIds,
	getAllCommentIds,
	getComment,
	getCommentBounds,
	getEmptySpace,
	getFlyoutBlock,
	getGridSpacing,
	getHighlightedBlockIds,
	getHighlightedCommentIds,
	getMultiselectDraggableId,
	getSelectedId,
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
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));
	await act(page.keyboard.up("Shift"));
});

test("duplicate comments via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
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
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
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

	await act(page.keyboard.press("Control+V"));
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
});

test("delete comments via keyboard", async ({ page, act }) => {
	await act(page.keyboard.press("Delete"));

	expect(await getAllCommentIds(page)).toEqual(["comment3"]);
	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});

test("delete comments via context menu", async ({ page, act }) => {
	await act(
		page.mouse.click(...(await getComment(page, "comment1")), {
			button: "right",
		}),
	);
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
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
	const comment1BoundsStart = await getCommentBounds(page, "comment1");
	const comment2BoundsStart = await getCommentBounds(page, "comment2");
	const comment3BoundsStart = await getCommentBounds(page, "comment3");
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
	const comment3BoundsEnd = await getCommentBounds(page, "comment3");
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

test("dragging block from toolbox selects new block", async ({ page, act }) => {
	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	expect(await getHighlightedCommentIds(page)).toEqual([
		"comment1",
		"comment2",
	]);
	expect(await getSelectedId(page)).toBe(await getMultiselectDraggableId(page));
	await act(page.mouse.move(...(await getFlyoutBlock(page, "controls_if"))));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	expect(await getHighlightedCommentIds(page)).toEqual([]);
	const allBlockIds = await getAllBlockIds(page);
	expect(allBlockIds).toHaveLength(1);
	expect(await getHighlightedBlockIds(page)).toEqual(allBlockIds);
	expect(await getSelectedId(page)).toBe(allBlockIds[0]);
});
