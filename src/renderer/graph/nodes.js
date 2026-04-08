/** @import { RenderGraph, RenderGraphContext } from "./rendergraph.js" */
/** @import { View } from "../core/index.js" */
/** @import { ViewFiller } from "../renderer.js" */
/** @import { Plugin } from "../plugin.js" */
/** @import { Object3D } from "../../objects/index.js" */
/** @import { WebGLRenderDevice } from "../../core/index.js" */
/** @import { WebGLRenderer } from "../renderer.js" */
import { assert } from "../../utils/index.js"
import { ViewFillers } from "../viewfillers.js"

/**
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {readonly Object3D[]} objects
 * @param {readonly Plugin[]} plugins
 * @param {View} view
 * @param {ViewFiller | undefined} fill
 */
function runViewFiller(device, renderer, objects, plugins, view, fill) {
  if (!fill) {
    return
  }

  fill(device, renderer, objects, plugins, view)
}

export class FillViewsNode {
  /**
   * @param {RenderGraphContext} context
   */
  execute(context) {
    const { views, renderer, objects, renderDevice } = context
    const viewFillers = renderer.getResource(ViewFillers)

    assert(viewFillers, "ViewFillers resource missing")

    for (let i = 0; i < views.length; i++) {
      const view = /** @type {View} */ (views[i])
      const fill = viewFillers.get(view.tag)

      runViewFiller(renderDevice, renderer, objects, renderer.plugins, view, fill)
    }
  }
}

export class SortViewsNode {
  /**
   * @param {RenderGraphContext} context
   */
  execute(context) {
    context.sortedViews = context.views
      .map((view, index) => ({ view, index }))
      .sort((a, b) => {
        const order = a.view.order - b.view.order

        if (order !== 0) {
          return order
        }

        return a.index - b.index
      })
      .map((entry) => entry.view)
  }
}

export class RenderViewsNode {
  /**
   * @param {RenderGraphContext} context
   */
  execute(context) {
    const { renderer, renderDevice } = context
    const sortedViews = context.sortedViews.length > 0 ? context.sortedViews : context.views

    for (let i = 0; i < sortedViews.length; i++) {
      const view = /** @type {View} */ (sortedViews[i])

      renderer.updateUBO(renderDevice.context, view.getData())
      view.renderItems(renderDevice, renderer, renderer.uniformBinders)
    }
  }
}

export class SubgraphNode {
  /**
   * @private
   * @type {RenderGraph}
   */
  subgraph

  /**
   * @param {RenderGraph} subgraph
   */
  constructor(subgraph) {
    this.subgraph = subgraph
  }

  /**
   * @param {RenderGraphContext} context
   */
  execute(context) {
    this.subgraph.execute(context)
  }
}
