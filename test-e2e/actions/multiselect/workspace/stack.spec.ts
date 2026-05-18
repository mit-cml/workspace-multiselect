import { expect } from "@playwright/test";
import {
	getBlock,
	getEmptySpace,
	getStackBlockIds,
	loadBlocks,
	test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
	await act(
		loadBlocks(page, [
			{
				type: "text_print",
				id: "stack1_top",
				next: {
					block: {
						type: "text_print",
						id: "stack1_middle",
						next: {
							block: { type: "text_print", id: "stack1_bottom" },
						},
					},
				},
			},
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
		]),
	);
	await act(page.keyboard.down("Shift"));
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "stack1_middle" })).centerTop,
		),
	);
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "stack2_middle" })).centerTop,
		),
	);
	await act(page.keyboard.up("Shift"));
});

test("drag middle blocks from stacks", async ({ page, act }) => {
	await act(
		page.mouse.move(
			...(await getBlock(page, { id: "stack1_middle" })).centerTop,
		),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	expect(await getStackBlockIds(page, "stack1_top")).toEqual(["stack1_top"]);
	expect(await getStackBlockIds(page, "stack1_middle")).toEqual([
		"stack1_middle",
		"stack1_bottom",
	]);
	expect(await getStackBlockIds(page, "stack2_top")).toEqual(["stack2_top"]);
	expect(await getStackBlockIds(page, "stack2_middle")).toEqual([
		"stack2_middle",
		"stack2_bottom",
	]);
});
