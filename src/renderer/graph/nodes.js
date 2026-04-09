/** @import { RenderGraphContext } from "./rendergraph.js" */
/** @import { View } from "../core/index.js" */
/** @import { ViewFiller } from "../renderer.js" */
/** @import { Plugin } from "../plugin.js" */
/** @import { Object3D } from "../../objects/index.js" */
/** @import { WebGLRenderDevice } from "../../core/index.js" */
/** @import { WebGLRenderer } from "../renderer.js" */
import { assert } from "../../utils/index.js"
import { ViewFillers } from "../viewfillers.js"
import { Views } from "../views.js"

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
    const { renderer, objects, renderDevice } = context
    const viewFillers = renderer.getResource(ViewFillers)
    const views = renderer.getResource(Views)

    assert(viewFillers, "ViewFillers resource missing")
    assert(views, "Views resource missing")

    const viewItems = views.items()

    for (let i = 0; i < viewItems.length; i++) {
      const view = /** @type {View} */ (viewItems[i])
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
    const views = context.renderer.getResource(Views)

    assert(views, "Views resource missing")

    const sorted = views.items()
      .map((view, index) => ({ view, index }))
      .sort((a, b) => {
        const order = a.view.order - b.view.order

        if (order !== 0) {
          return order
        }

        return a.index - b.index
      })
      .map((entry) => entry.view)

    views.clear()
    views.push(...sorted)
  }
}

export class RenderViewsNode {
  /**
   * @param {RenderGraphContext} context
   */
  execute(context) {
    const { renderer, renderDevice } = context
    const views = renderer.getResource(Views)

    assert(views, "Views resource missing")
    const viewItems = views.items()

    for (let i = 0; i < viewItems.length; i++) {
      const view = /** @type {View} */ (viewItems[i])

      renderer.updateUBO(renderDevice.context, view.getData())
      view.renderItems(renderDevice, renderer, renderer.uniformBinders)
    }
  }
}
