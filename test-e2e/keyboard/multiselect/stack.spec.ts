import { expect } from "@playwright/test";
import {
	getBlock,
	getHighlightedBlockIds,
	getSelectedId,
	loadBlocks,
	test,
} from "../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{ type: "math_number", id: "stack1" },
			{
				type: "text_print",
				id: "stack2_top",
				next: {
					block: {
						type: "text_print",
						id: "stack2_middle",
						next: {
							block: { type: "text_print", id: "stack2_bottom" },
						},
					},
				},
			},
			{
				type: "text_print",
				id: "stack3_top",
				next: {
					block: {
						type: "text_print",
						id: "stack3_middle",
						next: {
							block: { type: "text_print", id: "stack3_bottom" },
						},
					},
				},
			},
			{ type: "math_number", id: "stack4" },
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "stack2_middle" })).centerTop,
		),
	);
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "stack3_middle" })).centerTop,
		),
	);
	await act(page.keyboard.up("Shift"));
});

test("navigate up", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack2_top"]);
	expect(await getSelectedId(page)).toBe("stack2_top");
});

test("navigate down", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack3_bottom"]);
	expect(await getSelectedId(page)).toBe("stack3_bottom");
});

test("navigate to previous stack", async ({ page, act }) => {
	await act(page.keyboard.press("B"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack1"]);
	expect(await getSelectedId(page)).toBe("stack1");
});

test("navigate to next stack", async ({ page, act }) => {
	await act(page.keyboard.press("N"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack4"]);
	expect(await getSelectedId(page)).toBe("stack4");
});
