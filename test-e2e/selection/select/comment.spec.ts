import { expect } from "@playwright/test";
import {
	getComment,
	getEmptySpace,
	getHighlightedCommentIds,
	getSelectedId,
	loadComments,
	test,
} from "../../test";

test("clicking comment selects it", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));

	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);

	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});

test("clicking selected comment keeps selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);

	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);

	expect(await getHighlightedCommentIds(page)).toEqual(["comment1"]);
	expect(await getSelectedId(page)).toBe("comment1");
});

test("clicking unselected comment selects it", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }, { id: "comment2" }]));
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);

	await act(
		page.mouse.click(...(await getComment(page, "comment2")).centerTop),
	);

	expect(await getHighlightedCommentIds(page)).toEqual(["comment2"]);
	expect(await getSelectedId(page)).toBe("comment2");
});

test("clicking empty space clears selection", async ({ page, act }) => {
	await act(loadComments(page, [{ id: "comment1" }]));
	await act(
		page.mouse.click(...(await getComment(page, "comment1")).centerTop),
	);

	await act(page.mouse.click(...(await getEmptySpace(page))));

	expect(await getHighlightedCommentIds(page)).toEqual([]);
	expect(await getSelectedId(page)).toBeNull();
});
