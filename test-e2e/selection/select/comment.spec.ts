import { expect } from "@playwright/test";
import {
	getComment,
	getEmptySpace,
	getFlyoutBlock,
	getSelectedBlockIds,
	getSelectedCommentIds,
	loadComments,
	test,
} from "../../test";

test("clicking comment selects it", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));

	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);
});

test("clicking selected comment keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);
});

test("clicking unselected comment selects it", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.mouse.click(...(await getComment(page, "comment2"))));

	expect(await getSelectedCommentIds(page)).toEqual(["comment2"]);
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getSelectedCommentIds(page)).toEqual([]);
});

test("opening toolbox keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());

	expect(await getSelectedCommentIds(page)).toEqual(["comment1"]);
});

test("dragging block from toolbox selects new block", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }]));
	await act(page.mouse.click(...(await getComment(page, "comment1"))));

	await act(page.getByRole("treeitem", { name: "Logic" }).click());
	await act(page.mouse.move(...(await getFlyoutBlock(page, "controls_if"))));
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	expect(await getSelectedCommentIds(page)).toEqual([]);
	expect(await getSelectedBlockIds(page)).toHaveLength(1);
});
