/**
 * @license
 * Copyright 2022 MIT
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Patch the Blockly for this plugin.
 */

import * as Blockly from 'blockly/core';

/**
 * Disable the drag surface.
 * @override
 */
Blockly.utils.svgMath.is3dSupported = function() {
  return false;
};

/**
 * Fix when you drag the selected children blocks from their unselected parent
 * the children blocks of the selected ones can be out of the position while
 * still connected (do should remain connected).
 * @override
 */
Blockly.BlockDragger.prototype.updateBlockAfterMove_ = (function(func) {
  if (func.isWrapped) {
    return func;
  } else {
    const wrappedFunc = function(delta) {
      func.call(this, delta);
      // TODO: As App Inventor uses a different rendering algorithm than
      // base Blockly, we will have to verify if this is still OKay/neccessary.

      // Each time you render a block it rerenders all of that block's
      // parents as well.
      this.draggingBlock_.getDescendants(false).forEach(function(block) {
        if (!block.getChildren().length) {
          block.render();
        }
      });
    };
    wrappedFunc.isWrapped = true;
    return wrappedFunc;
  }
})(Blockly.BlockDragger.prototype.updateBlockAfterMove_);
