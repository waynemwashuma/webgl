/** @import { RenderGraphContext } from "./rendergraph.js" */
/** @import { View } from "../core/index.js" */
import { Camera } from "../../objects/index.js"
import { assert } from "../../utils/index.js"
import { Views } from "../views.js"

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
      if (view.tag === Camera.name) {
        continue
      }

      renderer.updateUBO(renderDevice.context, view.getData())
      view.renderItems(renderDevice, renderer, renderer.uniformBinders)
    }
  }
}
