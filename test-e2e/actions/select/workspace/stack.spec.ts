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
				id: "stack_top",
				next: {
					block: {
						type: "text_print",
						id: "stack_middle",
						next: {
							block: { type: "text_print", id: "stack_bottom" },
						},
					},
				},
			},
		]),
	);
});

test("drag middle block from stack", async ({ page, act }) => {
	await act(
		page.mouse.move(
			...(await getBlock(page, { id: "stack_middle" })).centerTop,
		),
	);
	await act(page.mouse.down());
	await act(page.mouse.move(...(await getEmptySpace(page))));
	await act(page.mouse.up());

	expect(await getStackBlockIds(page, "stack_top")).toEqual(["stack_top"]);
	expect(await getStackBlockIds(page, "stack_middle")).toEqual([
		"stack_middle",
		"stack_bottom",
	]);
});
