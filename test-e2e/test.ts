import { test as base, type Page } from "@playwright/test";
import type {
	comments,
	IComponent,
	serialization,
	WorkspaceSvg,
} from "blockly";

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
				(fieldBounds.left + fieldBounds.right) / 2,
				(fieldBounds.top + fieldBounds.bottom) / 2,
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
		const grid = workspace.getGrid();
		if (!grid) throw new Error("Workspace has no grid");
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				blocksBounds.right + grid.getSpacing(),
				blocksBounds.bottom + grid.getSpacing(),
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

export const getCommentBounds = (page: Page, id: string) =>
	page.evaluate((id) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const comment = workspace.getCommentById(
			id,
		) as RenderedWorkspaceComment | null;
		if (!comment) throw new Error(`Comment "${id}" not found`);
		const commentBounds = comment.getBoundingRectangle();
		const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(commentBounds.left, commentBounds.top),
		);
		const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(commentBounds.right, commentBounds.bottom),
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
		const commentBounds = comment.getBoundingRectangle();
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			workspace,
			new Blockly.utils.Coordinate(
				(commentBounds.left + commentBounds.right) / 2,
				commentBounds.top + 1,
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

export const isMultiselectEnabled = (page: Page) =>
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

export const getMultiselectIcon = (page: Page) =>
	page.evaluate(() => {
		const icon = document.querySelector(
			".blocklyMultiselect image",
		) as SVGImageElement | null;
		if (!icon) throw new Error("Multiselect icon not found");
		const iconBounds = icon.getBoundingClientRect();
		return [
			(iconBounds.left + iconBounds.right) / 2,
			(iconBounds.top + iconBounds.bottom) / 2,
		] as const;
	});

export const getFlyoutBlock = (page: Page, type: string) =>
	page.evaluate((type) => {
		const workspace = Blockly.getMainWorkspace() as WorkspaceSvg;
		const flyout = workspace.getFlyout();
		if (!flyout) throw new Error("Flyout not found");
		const flyoutWorkspace = flyout.getWorkspace();
		const block = flyoutWorkspace
			.getTopBlocks()
			.find((block) => block.type === type);
		if (!block) throw new Error(`Flyout block "${type}" not found`);
		const blockBounds = block.getBoundingRectangle();
		const { x, y } = Blockly.utils.svgMath.wsToScreenCoordinates(
			flyoutWorkspace,
			new Blockly.utils.Coordinate(
				(blockBounds.left + blockBounds.right) / 2,
				blockBounds.top + 1,
			),
		);
		return [x, y] as const;
	}, type);
