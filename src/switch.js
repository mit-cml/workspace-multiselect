/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Multiple selection svg switch.
 */

import {WorkspaceMultiSelect} from '../src/index';
import * as Blockly from 'blockly/core';

/**
 * Icon path of the multi select controls when enabled.
 * @type {string}
 * @const
 */
const ENABLED_IMG = 'media/select.svg';

/**
 * Icon path of the multi select controls when disabled.
 * @type {string}
 * @const
 */
const UNENABLED_IMG = 'media/unselect.svg';

/**
 * Width of the multi select controls.
 * @type {number}
 * @const
 */
const WIDTH = 32;

/**
 * Height of the multi select control.
 * @type {number}
 * @const
 */
const HEIGHT = 32;

/**
 * Distance between multi select controls and bottom or top edge of workspace.
 * @type {number}
 * @const
 */
const MARGIN_VERTICAL = 20;

/**
 * Distance between multi select controls and right or left edge of workspace.
 * @type {number}
 */
const MARGIN_HORIZONTAL = 20;

/**
 * Class for a multi select controls.
 * @implements {Blockly.IPositionable}
 */
export class MultiSelectControls {
  /**
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
   * @param {!WorkspaceMultiSelect} plugin The plugin to sit in.
   */
  constructor(workspace, plugin) {
    /**
     * @type {!Blockly.WorkspaceSvg} The workspace to sit in.
     * @private
     */
    this.workspace_ = workspace;

    /**
     * @type {!WorkspaceMultiSelect} The plugin to sit in.
     * @private
     */
    this.plugin_ = plugin;

    /**
     * State of the multi select controls.
     * @type {boolean}
     */
    this.enable = false;

    /**
     * The unique id for this component that is used to register with the
     * ComponentManager.
     * @type {string}
     */
    this.id = 'multiSelectControls';

    /**
     * A handle to use to unbind the mouse down event handler for multi select
     *    button. Opaque data returned from browserEvents.conditionalBind.
     * @type {?Blockly.browserEvents.Data}
     * @private
     */
    this.onMultiSelectWrapper_ = null;

    /**
     * The multi select svg <g> element.
     * @type {SVGGElement}
     * @private
     */
    this.multiSelectGroup_ = null;

    /**
     * Whether this has been initialized.
     * @type {boolean}
     * @private
     */
    this.initialized_ = false;
  }
  /**
   * Create the multi select controls.
   * @return {!SVGElement} The multi select controls SVG group.
   */
  createDom() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G, {}, null);
    this.createMultiSelectSvg_();
    return this.svgGroup_;
  }
  /**
   * Initializes the multi select controls.
   */
  init() {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 3,
      capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
    });
    this.initialized_ = true;
    this.workspace_.resize();
  }
  /**
   * Disposes of this multi select controls.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose() {
    this.workspace_.getComponentManager().removeComponent(this.id);
    if (this.svgGroup_) {
      Blockly.utils.dom.removeNode(this.svgGroup_);
    }
    if (this.onMultiSelectWrapper_) {
      Blockly.browserEvents.unbind(this.onMultiSelectWrapper_);
    }
  }
  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Blockly.utils.Rect} The UI elements's bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle() {
    const bottom = this.top_ + HEIGHT;
    const right = this.left_ + WIDTH;
    return new Blockly.utils.Rect(this.top_, bottom, this.left_, right);
  }
  /**
   * Positions the multi select controls.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }

    const cornerPosition =
      Blockly.uiPosition.getCornerOppositeToolbox(this.workspace_, metrics);
    const startRect = Blockly.uiPosition.getStartPositionRect(
        cornerPosition, new Blockly.utils.Size(WIDTH, HEIGHT),
        MARGIN_HORIZONTAL,
        MARGIN_VERTICAL, metrics, this.workspace_);

    const verticalPosition = cornerPosition.vertical;
    const bumpDirection = verticalPosition ===
      Blockly.uiPosition.verticalPosition.TOP ?
      Blockly.uiPosition.bumpDirection.DOWN :
      Blockly.uiPosition.bumpDirection.UP;
    const positionRect = Blockly.uiPosition.bumpPositionRect(
        startRect, MARGIN_VERTICAL, bumpDirection, savedPositions);

    if (verticalPosition === Blockly.uiPosition.verticalPosition.TOP) {
      this.MultiSelectGroup_.setAttribute(
          'transform', 'translate(0, ' + HEIGHT + ')');
    }

    this.top_ = positionRect.top;
    this.left_ = positionRect.left;
    this.svgGroup_.setAttribute(
        'transform', 'translate(' + this.left_ + ',' + this.top_ + ')');
  }
  /**
   * Create the zoom reset icon and its event handler.
   * @private
   */
  createMultiSelectSvg_() {
    /* This markup will be generated and added to the .svgGroup_:
    <g class="blocklyMultiSelect">
      <image width="32" height="32" xlink:href="media/unselect.svg"></image>
    </g>
    */
    this.MultiSelectGroup_ =
      Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {
        'class': 'blocklyMultiSelect',
      }, this.svgGroup_);
    const MultiSelectSvg = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE, {
          'width': WIDTH,
          'height': HEIGHT,
        },
        this.MultiSelectGroup_);
    MultiSelectSvg.setAttributeNS(
        Blockly.utils.dom.XLINK_NS, 'xlink:href', UNENABLED_IMG);

    // Attach event listeners.
    this.onMultiSelectWrapper_ = Blockly.browserEvents.conditionalBind(
        this.MultiSelectGroup_, 'mousedown', null,
        this.switchMultiSelect_.bind(this));
  }
  /**
   * Handles a mouse down event on the reset zoom button on the workspace.
   * @param {!Event} e A mouse down event.
   * @private
   */
  switchMultiSelect_(e) {
    this.workspace_.markFocused();
    this.enable = !this.enable;
    this.plugin_.switchMultiSelect(this.enable);
    Blockly.Touch.clearTouchIdentifier(); // Don't block future drags.
    e.stopPropagation(); // Don't start a workspace scroll.
    e.preventDefault(); // Stop double-clicking from selecting text.
  }

  /**
   * Updates the multi select icon.
   * @param {boolean} enable Whether the multi select is enabled.
   */
  updateMultiSelect(enable) {
    this.enable = enable;
    if (enable) {
      this.MultiSelectGroup_.firstElementChild.setAttributeNS(
          Blockly.utils.dom.XLINK_NS, 'xlink:href', ENABLED_IMG);
    } else {
      this.MultiSelectGroup_.firstElementChild.setAttributeNS(
          Blockly.utils.dom.XLINK_NS, 'xlink:href', UNENABLED_IMG);
    }
  }
}

/**
 * CSS for multi select controls.  See css.js for use.
 */
Blockly.Css.register(`
.blocklyMultiSelect>image, .blocklyMultiSelect>svg>image {
  opacity: .2;
}

.blocklyMultiSelect>image:hover, .blocklyMultiSelect>svg>image:hover {
  opacity: .4;
}

.blocklyMultiSelect>image:active, .blocklyMultiSelect>svg>image:active {
  opacity: .6;
}
`);
