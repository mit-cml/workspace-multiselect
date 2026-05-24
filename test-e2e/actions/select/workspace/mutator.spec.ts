import { expect } from "@playwright/test";
import {
  getAllBlockIds,
  getBlock,
  getHighlightedBlockIds,
  getSelectedId,
  loadBlocks,
  openMutator,
  test,
} from "../../../test";

test.beforeEach(async ({ page, act }) => {
  await act(
    loadBlocks(page, [
      {
        type: "procedures_defreturn",
        id: "block1",
        extraState: {
          params: [{ name: "param1", id: "param1" }],
        },
      },
    ]),
  );
  await act(openMutator(page, "block1"));
  
  const mutatorBlock = await getBlock(page, {
    workspace: { name: "mutator", mutatorOf: { id: "block1" } },
    type: "procedures_mutatorarg",
  });
  await act(page.mouse.click(...mutatorBlock.centerTop));
});

test("copy and paste mutator block via keyboard", async ({ page, act }) => {
  const mutatorBlockIds = await getAllBlockIds(page, {
    workspace: { name: "mutator", mutatorOf: { id: "block1" } },
  });
  const selectedMutatorBlockIds = await getHighlightedBlockIds(page, {
    workspace: { name: "mutator", mutatorOf: { id: "block1" } },
  });
  
  expect(await getAllBlockIds(page)).toEqual(["block1"]);
  expect(mutatorBlockIds).toHaveLength(2);
  expect(selectedMutatorBlockIds).toHaveLength(1);
  expect(await getSelectedId(page)).toBe(selectedMutatorBlockIds[0]);

  await act(page.keyboard.press('ControlOrMeta+c'));
  await act(page.keyboard.press('ControlOrMeta+v'));
  
  const allMutatorBlockIds = await getAllBlockIds(page, {
    workspace: { name: "mutator", mutatorOf: { id: "block1" } },
  });
  
  expect(await getAllBlockIds(page)).toEqual(["block1"]);
  expect(allMutatorBlockIds).toHaveLength(3);
  
  const newMutatorBlockId = allMutatorBlockIds.find(
    (id) => !mutatorBlockIds.includes(id)
  );
  expect(newMutatorBlockId).toBeDefined();

  expect(
    await getHighlightedBlockIds(page, {
      workspace: { name: "mutator", mutatorOf: { id: "block1" } },
    }),
  ).toEqual([newMutatorBlockId!]);
  
  expect(await getSelectedId(page)).toBe(newMutatorBlockId);
});

test("paste after closing mutator does nothing in main workspace", async ({
  page,
  act,
}) => {
  const initialMainBlockIds = await getAllBlockIds(page);
  
  await act(page.keyboard.press('ControlOrMeta+c'));
  
  await act(page.locator(`g[data-id="block1"] .blockly-icon-mutator`).click());
  
  await page.waitForFunction(
    (blockId) => {
      const workspace = (window as any).Blockly.getMainWorkspace();
      const block = workspace.getBlockById(blockId);
      if (!block) return true;
      const mutatorIcon = block.getIcon((window as any).Blockly.icons.IconType.MUTATOR);
      return !mutatorIcon || !mutatorIcon.bubbleIsVisible();
    },
    "block1",
  );

  await act(page.mouse.click(100, 100)); 
  await act(page.keyboard.press('ControlOrMeta+v'));
  
  expect(await getAllBlockIds(page)).toEqual(initialMainBlockIds);
});

test("paste after page reload does nothing", async ({ page, act }) => {
  const initialMainBlockIds = await getAllBlockIds(page);
  
  await act(page.keyboard.press('ControlOrMeta+c'));
  
  await page.reload();
  await page.locator(".blocklySvg").hover();
  
  await act(page.keyboard.press('ControlOrMeta+v'));
  
  expect(await getAllBlockIds(page)).toEqual(initialMainBlockIds);
});

