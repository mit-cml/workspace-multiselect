import { test as base, type Page } from "@playwright/test";
import type { comments, serialization, WorkspaceSvg } from "blockly";

type RenderedWorkspaceComment = comments.RenderedWorkspaceComment;

declare const Blockly: typeof import("blockly");

export const test = base.extend<{
	act: (action: Promise<void>) => Promise<void>;
}>({
	page: async ({ page }, use) => {
		await page.goto("/");
		await page.locator(".blocklySvg").hover();
		await use(page);
	},
	act: async ({ page }, use) => {
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

export const loadBlocks = (page: Page, blocks: serialization.blocks.State[]) =>
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

export const getBlockBounds = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		const blockBounds = block.getBoundingRectangleWithoutChildren();
		const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(blockBounds.left, blockBounds.top),
		);
		const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(blockBounds.right, blockBounds.bottom),
		);
		return {
			top: topLeft.y,
			bottom: bottomRight.y,
			left: topLeft.x,
			right: bottomRight.x,
		};
	}, id);

export const getBlock = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		const blockBounds = block.getBoundingRectangleWithoutChildren();
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				(blockBounds.left + blockBounds.right) / 2,
				blockBounds.top + 1,
			),
		);
		return [x, y] as const;
	}, id);

export const getBlockField = (page: Page, id: string, fieldName: string) =>
	page.evaluate(
		([id, fieldName]) => {
			const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
			const block = workspace.getBlockById(id);
			if (!block) throw new Error(`Block "${id}" not found`);
			const field = block.getField(fieldName);
			if (!field)
				throw new Error(`Field "${fieldName}" not found on block "${id}"`);
			const svgRoot = field.getSvgRoot();
			if (!svgRoot)
				throw new Error(
					`Field "${fieldName}" on block "${id}" has no SVG root`,
				);
			const fieldBounds = svgRoot.getBoundingClientRect();
			return [
				fieldBounds.x + fieldBounds.width / 2,
				fieldBounds.y + fieldBounds.height / 2,
			] as const;
		},
		[id, fieldName],
	);

export const getGridSpacing = (page: Page) =>
	page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		return workspace.getGrid()?.getSpacing() ?? null;
	});

export const getEmptySpace = (page: Page) =>
	page.evaluate(() => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const blocksBounds = workspace.getBlocksBoundingBox();
		const halfGridSpacing = (workspace.getGrid()?.getSpacing() ?? 25) / 2;
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				blocksBounds.right + halfGridSpacing,
				blocksBounds.bottom + halfGridSpacing,
			),
		);
		return [x, y] as const;
	});

export const getAllBlockIds = (page: Page) =>
	page.evaluate(() =>
		(Blockly.getMainWorkspace() as WorkspaceSvg)
			.getAllBlocks()
			.map((block) => block.id)
			.sort(),
	);

export const getSelectedBlockIds = (page: Page) =>
	page.evaluate(() =>
		(Blockly.getMainWorkspace() as WorkspaceSvg)
			.getAllBlocks()
			.filter((block) =>
				block.getSvgRoot().classList.contains("blocklySelected"),
			)
			.map((block) => block.id)
			.sort(),
	);

export const getBlockFieldValue = (page: Page, id: string, fieldName: string) =>
	page.evaluate(
		([id, fieldName]) => {
			const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
			const block = workspace.getBlockById(id);
			if (!block) throw new Error(`Block "${id}" not found`);
			const field = block.getField(fieldName);
			if (!field)
				throw new Error(`Field "${fieldName}" not found on block "${id}"`);
			return field.getValue();
		},
		[id, fieldName],
	);

export const isBlockCollapsed = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		return block.isCollapsed();
	}, id);

export const hasBlockComment = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		return block.hasIcon(Blockly.icons.CommentIcon.TYPE);
	}, id);

export const hasInlineInputs = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		return block.getInputsInline();
	}, id);

export const isBlockEnabled = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const block = workspace.getBlockById(id);
		if (!block) throw new Error(`Block "${id}" not found`);
		return block.isEnabled();
	}, id);

export const loadComments = (
	page: Page,
	comments: serialization.workspaceComments.State[],
) =>
	page.evaluate((comments) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const commentHeight = 100;
		const minBlockHeight = workspace
			.getRenderer()
			.getConstants().MIN_BLOCK_HEIGHT;
		Blockly.serialization.workspaces.load(
			{
				workspaceComments: comments.map((comment, index) => ({
					...comment,
					height: commentHeight,
					x: 0,
					y: index * (commentHeight + minBlockHeight),
				})),
			},
			workspace,
		);
		for (const comment of workspace.getTopComments() as RenderedWorkspaceComment[]) {
			comment.snapToGrid();
		}
	}, comments);

export const getCommentBounds = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const comment = workspace.getCommentById(
			id,
		) as RenderedWorkspaceComment | null;
		if (!comment) throw new Error(`Comment "${id}" not found`);
		const bounds = comment.getBoundingRectangle();
		const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(bounds.left, bounds.top),
		);
		const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(bounds.right, bounds.bottom),
		);
		return {
			top: topLeft.y,
			bottom: bottomRight.y,
			left: topLeft.x,
			right: bottomRight.x,
		};
	}, id);

export const getComment = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const comment = workspace.getCommentById(
			id,
		) as RenderedWorkspaceComment | null;
		if (!comment) throw new Error(`Comment "${id}" not found`);
		const bounds = comment.getBoundingRectangle();
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				(bounds.left + bounds.right) / 2,
				bounds.top + 1,
			),
		);
		return [x, y] as const;
	}, id);

export const getAllCommentIds = (page: Page) =>
	page.evaluate(() =>
		(Blockly.getMainWorkspace() as WorkspaceSvg)
			.getTopComments()
			.map((comment) => comment.id)
			.sort(),
	);

export const getSelectedCommentIds = (page: Page) =>
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
