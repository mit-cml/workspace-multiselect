import { expect } from "@playwright/test";
import {
	getComment,
	getCommentBounds,
	getEmptySpace,
	getGridSpacing,
	getSelectedCommentIds,
	loadComments,
	test,
} from "../test";

test("shift click selects comment", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));

	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("shift click adds comment to selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("shift click removes comment from selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment2"]);
});

test("shift click on empty space keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("releasing shift keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	await act(page.keyboard.up("Shift"));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("clicking selected comment keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("clicking unselected comment clears selection", async ({ page, act }) => {
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

	await act(page.mouse.click(...(await getComment(page, "comment3"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment3"]);
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));
	await act(page.keyboard.up("Shift"));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedCommentIds(page)).toEqual([]);
});

test("shift dragging rectangle selects comments", async ({ page, act }) => {
	await act(
		loadComments(page, [
			{ id: "comment1" },
			{ id: "comment2" },
			{ id: "comment3" },
		]),
	);
	const comment1Bounds = await getCommentBounds(page, "comment1");
	const comment2Bounds = await getCommentBounds(page, "comment2");
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.move(
			comment1Bounds.left - halfGridSpacing,
			comment1Bounds.top - halfGridSpacing,
		),
	);
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			(comment2Bounds.left + comment2Bounds.right) / 2,
			(comment2Bounds.top + comment2Bounds.bottom) / 2,
		),
	);
	await act(page.mouse.up());
	await act(page.keyboard.up("Shift"));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1", "comment2"]);
});

test("shift dragging rectangle deselects comments", async ({ page, act }) => {
	await act(
		loadComments(page, [
			{ id: "comment1" },
			{ id: "comment2" },
			{ id: "comment3" },
		]),
	);
	const comment1Bounds = await getCommentBounds(page, "comment1");
	const comment2Bounds = await getCommentBounds(page, "comment2");
	await act(page.keyboard.down("Shift"));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));
	await act(page.mouse.click(...(await getComment(page, "comment2"))));
	await act(page.keyboard.up("Shift"));

	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const halfGridSpacing = gridSpacing / 2;

	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.move(
			comment1Bounds.left - halfGridSpacing,
			comment1Bounds.top - halfGridSpacing,
		),
	);
	await act(page.mouse.down());
	await act(
		page.mouse.move(
			(comment2Bounds.left + comment2Bounds.right) / 2,
			(comment2Bounds.top + comment2Bounds.bottom) / 2,
		),
	);
	await act(page.mouse.up());
	await act(page.keyboard.up("Shift"));

	expect(await getSelectedCommentIds(page)).toEqual([]);
});
