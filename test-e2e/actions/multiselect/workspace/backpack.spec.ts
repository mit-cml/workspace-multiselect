import { expect } from "@playwright/test";
import {
  getBlock,
  loadBlocks,
  openBackpack,
  test,
} from "../../../test";

const blockStructure = [
  {
    type: "controls_if",
    id: "block-top",
    inputs: {
      DO0: {
        block: { type: "controls_if", id: "block-input" }
      }
    },
    next: {
      block: {
        type: "controls_if",
        id: "block-next",
        next: {
          block: { type: "controls_if", id: "block-bottom" }
        }
      }
    }
  }
];

/**
 * Toggles the backpackOnlySelected_ flag at runtime
 */
const setBackpackOnlySelected = async (page: any, value: boolean) => {
  await page.evaluate((val: boolean) => {
    const multiselectPlugin = (window as any).multiselectPlugin;
    multiselectPlugin.backpackOnlySelected_ = true;

    multiselectPlugin.dispose(false);
    multiselectPlugin.init({
        multiSelectKeys: ['Shift'],
        multiselectIcon: {
            hideIcon: false,
            weight: 3,
            enabledIcon: 'media/select.svg',
            disabledIcon: 'media/unselect.svg',
        },
        multiselectCopyPaste: {
            crossTab: true,
            menu: true,
        },
        backpackOnlySelected: val,
    });
  }, value);
}

test.describe("backpackOnlySelected_ OFF", () => {
  test.beforeEach(async ({ page, act }) => {
    await setBackpackOnlySelected(page, false);
    await act(loadBlocks(page, blockStructure));
  });

  test("select top block backpacks full chain", async ({ page, act }) => {
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" })).toBeVisible();
    
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" }).click());

    await openBackpack(page);
    await getBlock(page, { type: "controls_if", workspace: "backpack" });
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(1);
  });

  test("select top + input backpacks full chain", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-input" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" }).click());

    await openBackpack(page);
    await getBlock(page, { type: "controls_if", workspace: "backpack" });
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(1);
  });

  test("select top + next backpacks 2 chains", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-next" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" }).click());

    await openBackpack(page);
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(2);
  });

  test("select top + bottom backpacks 2 chains", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-bottom" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" }).click());

    await openBackpack(page);
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(2);
  });
});

test.describe("backpackOnlySelected_ ON", () => {
  test.beforeEach(async ({ page, act }) => {
    await setBackpackOnlySelected(page, true);
    await act(loadBlocks(page, blockStructure));
  });

  test("select top block backpacks selected + inputs only", async ({ page, act }) => {
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" }).click());

    await openBackpack(page);
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(1);
    
    await getBlock(page, { type: "controls_if", workspace: "backpack" });
  });

  test("select top + input backpacks selected + inputs only", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-input" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" }).click());

    await openBackpack(page);
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(1);
  });

  test("select top + next backpacks as single unit with inputs", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-next" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack" }).click());

    await openBackpack(page);
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(1);
  });

  test("select top + bottom backpacks 2 separate units", async ({ page, act }) => {
    await act(page.keyboard.down("Shift"));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop));
    await act(page.mouse.click(...(await getBlock(page, { id: "block-bottom" })).centerTop));
    await act(page.keyboard.up("Shift"));

    await act(page.mouse.click(...(await getBlock(page, { id: "block-top" })).centerTop, { button: "right" }));
    await expect(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" })).toBeVisible();
    await act(page.getByRole("menuitem", { exact: true, name: "Copy to Backpack (2)" }).click());

    await openBackpack(page);
    
    const topBlocks = await page.evaluate(() => {
        const ws = (window as any).Blockly.getMainWorkspace();
        const backpack = ws.getComponentManager().getComponent("backpack");
        if (!backpack) return 0;
        const flyout = backpack.getFlyout();
        if (!flyout) return 0;
        return flyout.getWorkspace().getTopBlocks().length;
    });
    expect(topBlocks).toBe(2);
  });
});