import { expect } from "@playwright/test";
import {
	cmdOrCtrl,
	getBlock,
	getGridSpacing,
	getHighlightedBlockIds,
	getSelectedId,
	getStackBlockIds,
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
			{ type: "math_number", id: "stack3" },
		]),
	);
	await act(
		page.mouse.click(
			...(await getBlock(page, { id: "stack2_middle" })).centerTop,
		),
	);
});

test("navigate up within stack", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowUp"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack2_top"]);
	expect(await getSelectedId(page)).toBe("stack2_top");
});

test("navigate down within stack", async ({ page, act }) => {
	await act(page.keyboard.press("ArrowDown"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack2_bottom"]);
	expect(await getSelectedId(page)).toBe("stack2_bottom");
});

test("navigate to previous stack", async ({ page, act }) => {
	await act(page.keyboard.press("B"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack1"]);
	expect(await getSelectedId(page)).toBe("stack1");
});

test("navigate to next stack", async ({ page, act }) => {
	await act(page.keyboard.press("N"));

	expect(await getHighlightedBlockIds(page)).toEqual(["stack3"]);
	expect(await getSelectedId(page)).toBe("stack3");
});

test("constrained move via shortcut", async ({ page, act }) => {
	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowDown"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_bottom",
		"stack2_middle",
	]);
});

test("abort constrained move via shortcut", async ({ page, act }) => {
	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowDown"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_middle",
		"stack2_bottom",
	]);
});

test("constrained move via context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowDown"));
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_bottom",
		"stack2_middle",
	]);
});

test("abort constrained move via context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	await act(page.keyboard.press("ArrowDown"));
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_middle",
		"stack2_bottom",
	]);
});

test("unconstrained move via shortcut", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const stack1BoundsStart = (await getBlock(page, { id: "stack1" })).bounds;
	const stack2TopBoundsStart = (await getBlock(page, { id: "stack2_top" }))
		.bounds;
	const stack3BoundsStart = (await getBlock(page, { id: "stack3" })).bounds;

	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	for (let i = 0; i < 3; i++) {
		await act(page.keyboard.press("Alt+ArrowRight"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_bottom",
	]);
	expect(await getStackBlockIds(page, "stack2_middle")).toEqual([
		"stack2_middle",
	]);
	const stack2MiddleBoundsEnd = (await getBlock(page, { id: "stack2_middle" }))
		.bounds;
	expect(stack2MiddleBoundsEnd.left - stack2TopBoundsStart.left).toBeCloseTo(
		3 * gridSpacing,
	);
	expect(stack2MiddleBoundsEnd.top - stack2TopBoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	const stack1BoundsEnd = (await getBlock(page, { id: "stack1" })).bounds;
	expect(stack1BoundsEnd.left).toBeCloseTo(stack1BoundsStart.left);
	expect(stack1BoundsEnd.top).toBeCloseTo(stack1BoundsStart.top);
	const stack3BoundsEnd = (await getBlock(page, { id: "stack3" })).bounds;
	expect(stack3BoundsEnd.left).toBeCloseTo(stack3BoundsStart.left);
	expect(stack3BoundsEnd.top).toBeCloseTo(stack3BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["stack2_middle"]);
	expect(await getSelectedId(page)).toBe("stack2_middle");
});

test("abort unconstrained move via shortcut", async ({ page, act }) => {
	await act(page.keyboard.press("M"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	for (let i = 0; i < 3; i++) {
		await act(page.keyboard.press("Alt+ArrowRight"));
	}
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_middle",
		"stack2_bottom",
	]);
});

test("unconstrained move via context menu", async ({ page, act }) => {
	const gridSpacing = await getGridSpacing(page);
	if (gridSpacing === null) throw new Error("Workspace has no grid");
	const stack1BoundsStart = (await getBlock(page, { id: "stack1" })).bounds;
	const stack2TopBoundsStart = (await getBlock(page, { id: "stack2_top" }))
		.bounds;
	const stack3BoundsStart = (await getBlock(page, { id: "stack3" })).bounds;

	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	for (let i = 0; i < 3; i++) {
		await act(page.keyboard.press("Alt+ArrowRight"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_bottom",
	]);
	expect(await getStackBlockIds(page, "stack2_middle")).toEqual([
		"stack2_middle",
	]);
	const stack2MiddleBoundsEnd = (await getBlock(page, { id: "stack2_middle" }))
		.bounds;
	expect(stack2MiddleBoundsEnd.left - stack2TopBoundsStart.left).toBeCloseTo(
		3 * gridSpacing,
	);
	expect(stack2MiddleBoundsEnd.top - stack2TopBoundsStart.top).toBeCloseTo(
		gridSpacing,
	);
	const stack1BoundsEnd = (await getBlock(page, { id: "stack1" })).bounds;
	expect(stack1BoundsEnd.left).toBeCloseTo(stack1BoundsStart.left);
	expect(stack1BoundsEnd.top).toBeCloseTo(stack1BoundsStart.top);
	const stack3BoundsEnd = (await getBlock(page, { id: "stack3" })).bounds;
	expect(stack3BoundsEnd.left).toBeCloseTo(stack3BoundsStart.left);
	expect(stack3BoundsEnd.top).toBeCloseTo(stack3BoundsStart.top);
	expect(await getHighlightedBlockIds(page)).toEqual(["stack2_middle"]);
	expect(await getSelectedId(page)).toBe("stack2_middle");
});

test("abort unconstrained move via context menu", async ({ page, act }) => {
	await act(page.keyboard.press(cmdOrCtrl("Enter")));
	for (let i = 0; i < 6; i++) {
		await act(page.keyboard.press("ArrowDown"));
	}
	await act(page.keyboard.press("Enter"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).toBeVisible();
	for (let i = 0; i < 3; i++) {
		await act(page.keyboard.press("Alt+ArrowRight"));
	}
	await act(page.keyboard.press("Escape"));
	await expect(page.locator(".blocklyMoveIndicatorBubble")).not.toBeVisible();

	expect(await getStackBlockIds(page, "stack2_top")).toEqual([
		"stack2_top",
		"stack2_middle",
		"stack2_bottom",
	]);
});
