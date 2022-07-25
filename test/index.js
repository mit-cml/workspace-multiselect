/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import {ScrollBlockDragger, ScrollMetricsManager,
  ScrollOptions} from '@blockly/plugin-scroll-options';
import {Multiselect, MultiselectBlockDragger} from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  // Monkey patch that can be removed when the patch is merged:
  // https://github.com/google/blockly-samples/pull/1202
  // Start monkey patch.
  ScrollBlockDragger.prototype.moveBlockWhileDragging = function(
      deltaX, deltaY) {
    this.scrollDelta_.x -= deltaX;
    this.scrollDelta_.y -= deltaY;

    // The total amount the block has moved since being picked up.
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, this.dragDelta_);

    const delta = this.pixelsToWorkspaceUnits_(totalDelta);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

    // Make the block stay under the cursor.
    this.draggingBlock_.moveDuringDrag(newLoc);

    this.dragIcons_(totalDelta);

    this.draggedConnectionManager_.update(
        new Blockly.utils.Coordinate(
            totalDelta.x / this.workspace_.scale,
            totalDelta.y / this.workspace_.scale),
        null);
  };
  ScrollOptions.prototype.enableWheelScroll = function() {
    if (this.wheelEvent_) {
      // Already enabled.
      return;
    }

    let element = this.workspace_.getBlockDragSurface().getSvgRoot();
    if (!Blockly.utils.svgMath.is3dSupported()) {
      element = this.workspace_.svgGroup_;
    }

    this.wheelEvent_ = Blockly.browserEvents.conditionalBind(
        element, 'wheel', this, this.onMouseWheel_);
  };
  // End monkey patch.

  const workspace = Blockly.inject(blocklyDiv, options);

  const scrollOptionsPlugin = new ScrollOptions(workspace);
  scrollOptionsPlugin.init();

  const multiselectPlugin = new Multiselect(workspace);
  multiselectPlugin.init(options);

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    useDoubleClick: true,
    bumpNeighbours: false,
    multiselectIcon: {
      enabledIcon: 'media/select.svg',
      disabledIcon: 'media/unselect.svg',
    },
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
    move: {
      wheel: true,
    },
    zoom: {
      wheel: true,
    },
    plugins: {
      'blockDragger': MultiselectBlockDragger,
      'metricsManager': ScrollMetricsManager,
    },
    baseBlockDragger: ScrollBlockDragger,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
