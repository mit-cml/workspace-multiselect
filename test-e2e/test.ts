import type { Backpack } from "@blockly/workspace-backpack";
import { test as base, type Page } from "@playwright/test";
import type {
	comments,
	IComponent,
	icons,
	serialization,
	WorkspaceSvg,
} from "blockly";

type RenderedWorkspaceComment = comments.RenderedWorkspaceComment;

declare const Blockly: typeof import("blockly");

declare global {
	interface Window {
		multiDraggableWeakMap: WeakMap<WorkspaceSvg, { id: string }>;
	}
}

type BlockSelector =
	| { id: string; type?: never; scope?: never }
	| { type: string; scope?: "all" | "top"; id?: never };

type WorkspaceSelector =
	| { name: "main"; mutatorOf?: never }
	| { name: "toolbox"; mutatorOf?: never }
	| { name: "trash"; mutatorOf?: never }
	| { name: "backpack"; mutatorOf?: never }
	| { name: "mutator"; mutatorOf: BlockSelector };

type BlocksQuery = { workspace?: WorkspaceSelector; block?: BlockSelector };
type BlockQuery = { workspace?: WorkspaceSelector } & BlockSelector;

type Act = (action: Promise<void>) => Promise<void>;
type Point = [number, number];
type Bounds = { top: number; bottom: number; left: number; right: number };
type FieldJSON = { center: Point; value: unknown | null };
type BlockJSON = {
	id: string;
	centerTop: Point;
	bounds: Bounds;
	isCollapsed: boolean;
	isHighlighted: boolean;
	hasComment: boolean;
	hasInlineInputs: boolean;
	isEnabled: boolean;
	fields: Record<string, FieldJSON>;
};
type CommentJSON = { centerTop: Point; bounds: Bounds };

export const test = base.extend<{ act: Act }>({
	page: async (
		{ page }: { page: Page },
		use: (page: Page) => Promise<void>,
	) => {
		await page.goto("/");
		await page.locator(".blocklySvg").hover();
		await use(page);
	},
	act: async ({ page }: { page: Page }, use: (act: Act) => Promise<void>) => {
		await use(async (action) => {
			await action;
			await page.evaluate(async () => {
				const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
				let eventFired = false;
				const events: object[] = [];
				const listener = workspace.addChangeListener((event) => {
					eventFired = true;
					events.push(event.toJson());
				});
				try {
					let frames = 0;
					do {
						if (++frames > 10) {
							throw new Error(
								`Blockly events still firing after 10 frames:\n${JSON.stringify(events, null, 2)}`,
							);
						}
						eventFired = false;
						await new Promise((resolve) =>
							requestAnimationFrame(() => setTimeout(resolve, 0)),
						);
					} while (eventFired);
				} finally {
					workspace.removeChangeListener(listener);
				}
			});
		});
	},
});

export const loadBlocks = (
	page: Page,
	blocks: serialization.blocks.State[],
): Promise<void> =>
	page.evaluate((blocks) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		Blockly.serialization.workspaces.load(
			{
				blocks: {
					blocks: blocks.map((block, index) => ({ ...block, y: index })),
				},
			},
			workspace,
		);
		workspace.cleanUp();
	}, blocks);

export const getBlocks = (
	page: Page,
	query: BlocksQuery = {},
): Promise<BlockJSON[]> =>
	page.evaluate((query: BlocksQuery) => {
		const getBlockFromWorkspace = (
			workspace: WorkspaceSvg,
			selector: BlockSelector,
		) =>
			selector.id
				? workspace.getBlockById(selector.id)
				: (selector.scope === "top"
						? workspace.getTopBlocks()
						: workspace.getAllBlocks()
					).find((b) => b.type === selector.type);

		const mainWorkspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const workspaceSelector = query.workspace ?? { name: "main" };
		let workspace: WorkspaceSvg;
		switch (workspaceSelector.name) {
			case "main":
				workspace = mainWorkspace;
				break;
			case "toolbox": {
				const flyout = mainWorkspace.getFlyout();
				if (!flyout) throw new Error("Toolbox flyout not found");
				workspace = flyout.getWorkspace();
				break;
			}
			case "trash": {
				const trash = mainWorkspace.trashcan;
				if (!trash) throw new Error("Trash not found");
				if (!trash.flyout) throw new Error("Trash flyout not found");
				workspace = trash.flyout.getWorkspace();
				break;
			}
			case "backpack": {
				const backpack = mainWorkspace
					.getComponentManager()
					.getComponent("backpack") as Backpack | undefined;
				if (!backpack) throw new Error("Backpack not found");
				const flyout = backpack.getFlyout();
				if (!flyout) throw new Error("Backpack flyout not found");
				workspace = flyout.getWorkspace();
				break;
			}
			case "mutator": {
				const mutatorSourceBlock = getBlockFromWorkspace(
					mainWorkspace,
					workspaceSelector.mutatorOf,
				);
				if (!mutatorSourceBlock)
					throw new Error("Mutator source block not found");
				const mutatorIcon = mutatorSourceBlock.getIcon<icons.MutatorIcon>(
					Blockly.icons.IconType.MUTATOR,
				);
				if (!mutatorIcon) throw new Error("Mutator icon not found");
				const mutatorWorkspace = mutatorIcon.getWorkspace();
				if (!mutatorWorkspace) throw new Error("Mutator workspace not found");
				workspace = mutatorWorkspace;
				break;
			}
			default:
				throw new Error(`Workspace "${(workspaceSelector as any).name}" not found`);
		}
		const blocks = query.block
			? [getBlockFromWorkspace(workspace, query.block)].filter((block) => !!block)
			: workspace.getAllBlocks();
		return blocks.map((block) => {
			const workspaceBounds = block.getBoundingRectangleWithoutChildren();
			const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
				workspace,
				new Blockly.utils.Coordinate(workspaceBounds.left, workspaceBounds.top),
			);
			const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
				workspace,
				new Blockly.utils.Coordinate(
					workspaceBounds.right,
					workspaceBounds.bottom,
				),
			);
			const bounds = {
				top: topLeft.y,
				bottom: bottomRight.y,
				left: topLeft.x,
				right: bottomRight.x,
			};
			const centerTop: Point = [(bounds.left + bounds.right) / 2, bounds.top + 1];
			const fields: Record<string, FieldJSON> = {};
			for (const input of block.inputList) {
				for (const field of input.fieldRow) {
					if (!field.name) continue;
					const svgRoot = field.getSvgRoot();
					if (!svgRoot) continue;
					const fieldBounds = svgRoot.getBoundingClientRect();
					fields[field.name] = {
						center: [
							(fieldBounds.left + fieldBounds.right) / 2,
							(fieldBounds.top + fieldBounds.bottom) / 2,
						],
						value: field.getValue(),
					};
				}
			}
			return {
				id: block.id,
				centerTop,
				bounds,
				isCollapsed: block.isCollapsed(),
				isHighlighted: block.getSvgRoot().classList.contains("blocklySelected"),
				hasComment: block.hasIcon(Blockly.icons.CommentIcon.TYPE),
				hasInlineInputs: block.getInputsInline(),
				isEnabled: block.isEnabled(),
				fields,
			};
		});
	}, query);

export const getBlock = async (
	page: Page,
	query: BlockQuery,
): Promise<BlockJSON> => {
	const blocks = await getBlocks(page, {
		workspace: query.workspace,
		block: query,
	});
	if (blocks.length === 0) throw new Error("Block not found");
	if (blocks.length > 1) throw new Error("Expected one block, found multiple");
	return blocks[0];
};

export const getAllBlockIds = (
  page: Page,
  query: BlocksQuery = {},  // <-- ADD PARAMETER
): Promise<string[]> =>
  getBlocks(page, query).then((blocks) =>
    blocks.map((block) => block.id).sort(),
  );

export const getHighlightedBlockIds = (
  page: Page,
  query: BlocksQuery = {},  // <-- ADD PARAMETER
): Promise<string[]> =>
  getBlocks(page, query).then((blocks) =>
    blocks
      .filter((block) => block.isHighlighted)  // <-- USE NEW FIELD
      .map((block) => block.id)
      .sort(),
  );

export const loadComments = (
	page: Page,
	comments: serialization.workspaceComments.State[],
): Promise<void> =>
	page.evaluate((comments) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const commentHeight = 100;
		const grid = workspace.getGrid();
		if (!grid) throw new Error("Workspace has no grid");
		Blockly.serialization.workspaces.load(
			{
				workspaceComments: comments.map((comment, index) => ({
					...comment,
					height: commentHeight,
					x: 0,
					y: index * (commentHeight + grid.getSpacing()),
				})),
			},
			workspace,
		);
		for (const comment of workspace.getTopComments() as RenderedWorkspaceComment[]) {
			comment.snapToGrid();
		}
	}, comments);

export const getComment = (page: Page, id: string): Promise<CommentJSON> =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const comment = workspace.getCommentById(
			id,
		) as RenderedWorkspaceComment | null;
		if (!comment) throw new Error(`Comment "${id}" not found`);
		const workspaceBounds = comment.getBoundingRectangle();
		const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(workspaceBounds.left, workspaceBounds.top),
		);
		const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				workspaceBounds.right,
				workspaceBounds.bottom,
			),
		);
		const bounds = {
			top: topLeft.y,
			bottom: bottomRight.y,
			left: topLeft.x,
			right: bottomRight.x,
		};
		const centerTop: Point = [(bounds.left + bounds.right) / 2, bounds.top + 1];
		return { centerTop, bounds };
	}, id);

export const getAllCommentIds = (page: Page): Promise<string[]> =>
	page.evaluate(() =>
		(Blockly.getMainWorkspace() as WorkspaceSvg)
			.getTopComments()
			.map((comment) => comment.id)
			.sort(),
	);

export const getHighlightedCommentIds = (page: Page): Promise<string[]> =>
	page.evaluate(() =>
		(Blockly.getMainWorkspace() as WorkspaceSvg)
			.getTopComments()
			.filter((comment) =>
				(comment as RenderedWorkspaceComment)
					.getSvgRoot()
					.classList.contains("blocklySelected"),
			)
			.map((comment) => comment.id)
			.sort(),
	);

export const getSelectedId = (page: Page): Promise<string | null> =>
	page.evaluate(() => Blockly.getSelected()?.id ?? null);

export const getMultiselectDraggableId = (page: Page): Promise<string> =>
	page.evaluate(() => {
		const multiselectDraggable = window.multiDraggableWeakMap.get(
			Blockly.getMainWorkspace() as WorkspaceSvg,
		);
		if (!multiselectDraggable)
			throw new Error("MultiselectDraggable not found");
		return multiselectDraggable.id;
	});

export const getGridSpacing = (page: Page): Promise<number | null> =>
	page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		return workspace.getGrid()?.getSpacing() ?? null;
	});

export const getEmptySpace = (page: Page): Promise<Point> =>
	page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const blocksBounds = workspace.getBlocksBoundingBox();
		const grid = workspace.getGrid();
		if (!grid) throw new Error("Workspace has no grid");
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				blocksBounds.right + grid.getSpacing(),
				blocksBounds.bottom + grid.getSpacing(),
			),
		);
		return [x, y];
	});

export const getTrash = async (page: Page): Promise<Point> => {
	const trash = await page.locator(".blocklyTrash").boundingBox();
	if (!trash) throw new Error("Trash not found");
	return [trash.x + trash.width / 2, trash.y + trash.height / 2];
};

export const openTrash = async (page: Page): Promise<void> => {
	await page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const trash = workspace.trashcan;
		if (!trash) throw new Error("Trash not found");
		trash.openFlyout();
	});
	await page.waitForFunction(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const trash = workspace.trashcan;
		if (!trash) throw new Error("Trash not found");
		if (!trash.flyout) throw new Error("Trash flyout not found");
		return trash.flyout.isVisible();
	});
};

export const getBackpack = async (page: Page): Promise<Point> => {
	const backpack = await page.locator(".blocklyBackpack").boundingBox();
	if (!backpack) throw new Error("Backpack not found");
	return [backpack.x + backpack.width / 2, backpack.y + backpack.height / 2];
};

export const openBackpack = async (page: Page): Promise<void> => {
	await page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const backpack = workspace.getComponentManager().getComponent("backpack") as
			| Backpack
			| undefined;
		if (!backpack) throw new Error("Backpack not found");
		backpack.open();
	});
};

export const openMutator = async (
  page: Page,
  blockId: string,
): Promise<void> => {
  await page.locator(`g[data-id="${blockId}"] .blockly-icon-mutator`).click();
  await page.waitForFunction(
    (blockId) => {
      const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
      const block = workspace.getBlockById(blockId);
      if (!block) return false;
      const mutatorIcon = block.getIcon(Blockly.icons.IconType.MUTATOR);
      if (!mutatorIcon) return false;
      return mutatorIcon.bubbleIsVisible();
    },
    blockId,
  );
};

export const isMultiselectEnabled = (page: Page): Promise<boolean> =>
	page.evaluate(() => {
		const icon = document.querySelector(
			".blocklyMultiselect image",
		) as SVGImageElement | null;
		if (!icon) throw new Error("Multiselect icon not found");
		const href = icon.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		if (!href) throw new Error("Multiselect icon has no href");
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const controls = workspace
			.getComponentManager()
			.getComponent("multiselectControls") as
			| (IComponent & { enabled_img: string; disabled_img: string })
			| undefined;
		if (!controls) throw new Error("Multiselect controls not found");
		if (href === controls.enabled_img) return true;
		if (href === controls.disabled_img) return false;
		throw new Error(
			`Multiselect icon href "${href}" does not match either icon`,
		);
	});
