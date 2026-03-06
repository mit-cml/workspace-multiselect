import { expect } from "@playwright/test";
import { getBlock, loadBlocks, test } from "../test";

test.describe("selection count", () => {
	test.beforeEach(async ({ page, act }) => {
		await act(
			loadBlocks(page, [
				{ type: "math_number", id: "block1" },
				{ type: "math_number", id: "block2" },
				{ type: "math_number", id: "block3" },
			]),
		);
		await act(page.keyboard.down("Shift"));
		await act(page.mouse.click(...(await getBlock(page, "block1"))));
		await act(page.mouse.click(...(await getBlock(page, "block2"))));
		await act(page.keyboard.up("Shift"));
		await act(
			page.mouse.click(...(await getBlock(page, "block1")), {
				button: "right",
			}),
		);
	});

	test("copy", async ({ page }) => {
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Copy (2)" })
				.textContent(),
		).toBe("Copy (2)");
	});

	test("duplicate", async ({ page }) => {
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Duplicate (2)" })
				.textContent(),
		).toBe("Duplicate (2)");
	});

	test("delete", async ({ page }) => {
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Delete 2 Blocks" })
				.textContent(),
		).toBe("Delete 2 Blocks");
	});
});

test.describe("comment count", () => {
	test.beforeEach(async ({ page, act }) => {
		const comment = { icons: { comment: { text: "" } } };
		await act(
			loadBlocks(page, [
				{ type: "math_number", id: "block1" },
				{ type: "math_number", id: "block2" },
				{ type: "math_number", id: "block3" },
				{ type: "math_number", id: "block4", ...comment },
				{ type: "math_number", id: "block5", ...comment },
				{ type: "math_number", id: "block6", ...comment },
				{ type: "math_number", id: "block7", ...comment },
			]),
		);
		await act(page.keyboard.down("Shift"));
		await act(page.mouse.click(...(await getBlock(page, "block2"))));
		await act(page.mouse.click(...(await getBlock(page, "block3"))));
		await act(page.mouse.click(...(await getBlock(page, "block4"))));
		await act(page.mouse.click(...(await getBlock(page, "block5"))));
		await act(page.mouse.click(...(await getBlock(page, "block6"))));
		await act(page.keyboard.up("Shift"));
	});

	test("add", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block2")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Add Comment (2)" })
				.textContent(),
		).toBe("Add Comment (2)");
	});

	test("remove", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block4")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Remove Comment (3)" })
				.textContent(),
		).toBe("Remove Comment (3)");
	});
});

test.describe("inputs count", () => {
	test.beforeEach(async ({ page, act }) => {
		await act(
			loadBlocks(page, [
				{ type: "math_arithmetic", id: "block1" },
				{ type: "math_arithmetic", id: "block2" },
				{ type: "math_arithmetic", id: "block3" },
				{ type: "math_arithmetic", id: "block4", inline: false },
				{ type: "math_arithmetic", id: "block5", inline: false },
				{ type: "math_arithmetic", id: "block6", inline: false },
				{ type: "math_arithmetic", id: "block7", inline: false },
			]),
		);
		await act(page.keyboard.down("Shift"));
		await act(page.mouse.click(...(await getBlock(page, "block2"))));
		await act(page.mouse.click(...(await getBlock(page, "block3"))));
		await act(page.mouse.click(...(await getBlock(page, "block4"))));
		await act(page.mouse.click(...(await getBlock(page, "block5"))));
		await act(page.mouse.click(...(await getBlock(page, "block6"))));
		await act(page.keyboard.up("Shift"));
	});

	test("external", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block2")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "External Inputs (2)" })
				.textContent(),
		).toBe("External Inputs (2)");
	});

	test("inline", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block4")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Inline Inputs (3)" })
				.textContent(),
		).toBe("Inline Inputs (3)");
	});
});

test.describe("collapse/expand count", () => {
	test.beforeEach(async ({ page, act }) => {
		await act(
			loadBlocks(page, [
				{ type: "math_number", id: "block1" },
				{ type: "math_number", id: "block2" },
				{ type: "math_number", id: "block3" },
				{ type: "math_number", id: "block4", collapsed: true },
				{ type: "math_number", id: "block5", collapsed: true },
				{ type: "math_number", id: "block6", collapsed: true },
				{ type: "math_number", id: "block7", collapsed: true },
			]),
		);
		await act(page.keyboard.down("Shift"));
		await act(page.mouse.click(...(await getBlock(page, "block2"))));
		await act(page.mouse.click(...(await getBlock(page, "block3"))));
		await act(page.mouse.click(...(await getBlock(page, "block4"))));
		await act(page.mouse.click(...(await getBlock(page, "block5"))));
		await act(page.mouse.click(...(await getBlock(page, "block6"))));
		await act(page.keyboard.up("Shift"));
	});

	test("collapse", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block2")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Collapse Block (2)" })
				.textContent(),
		).toBe("Collapse Block (2)");
	});

	test("expand", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block4")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Expand Block (3)" })
				.textContent(),
		).toBe("Expand Block (3)");
	});
});

test.describe("disable/enable count", () => {
	test.beforeEach(async ({ page, act }) => {
		await act(
			loadBlocks(page, [
				{ type: "math_number", id: "block1" },
				{ type: "math_number", id: "block2" },
				{ type: "math_number", id: "block3" },
				{ type: "math_number", id: "block4", enabled: false },
				{ type: "math_number", id: "block5", enabled: false },
				{ type: "math_number", id: "block6", enabled: false },
				{ type: "math_number", id: "block7", enabled: false },
			]),
		);
		await act(page.keyboard.down("Shift"));
		await act(page.mouse.click(...(await getBlock(page, "block2"))));
		await act(page.mouse.click(...(await getBlock(page, "block3"))));
		await act(page.mouse.click(...(await getBlock(page, "block4"))));
		await act(page.mouse.click(...(await getBlock(page, "block5"))));
		await act(page.mouse.click(...(await getBlock(page, "block6"))));
		await act(page.keyboard.up("Shift"));
	});

	test("disable", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block2")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Disable Block (2)" })
				.textContent(),
		).toBe("Disable Block (2)");
	});

	test("enable", async ({ page, act }) => {
		await act(
			page.mouse.click(...(await getBlock(page, "block4")), {
				button: "right",
			}),
		);
		expect(
			await page
				.getByRole("menuitem", { exact: true, name: "Enable Block (3)" })
				.textContent(),
		).toBe("Enable Block (3)");
	});
});
