import { AnimationPlayer } from "../../../animation/player.js"

export class AnimationAdvanceNode {
  /**
   * @type {number | undefined}
   */
  #lastNow

  subgraph() {
    return undefined
  }

  /**
   * @param {import("../../../renderer/graph/index.js").RenderGraphContext} context
   */
  execute(context) {
    const now = performance.now()
    const lastNow = this.#lastNow
    this.#lastNow = now

    const delta = lastNow === undefined ? 0 : (now - lastNow) / 1000

    for (let i = 0; i < context.objects.length; i++) {
      const root = /** @type {import("../../../objects/object3d.js").Object3D} */ (context.objects[i])

      root.traverseDFS((object) => {
        if (object instanceof AnimationPlayer) {
          object.animate(delta)
        }

        return true
      })
    }
  }
}


