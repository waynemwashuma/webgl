import { FillViewsNode, Plugin, WebGLRenderer } from "../../renderer/index.js";
import { ShadowMap, ShadowPipelines } from "./resources";
import { ShadowOccluderNode, ShadowViewNode } from "./nodes";

export class ShadowPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    const maxShadows = 10
    renderer.setResource(new ShadowMap(maxShadows))
    renderer.setResource(new ShadowPipelines())
    renderer.defines.set('MAX_SHADOW_CASTERS', maxShadows.toString())

    renderer.renderGraph.addNode(ShadowViewNode.name, new ShadowViewNode())
    renderer.renderGraph.addNode(ShadowOccluderNode.name, new ShadowOccluderNode())
    renderer.renderGraph.addDependency(ShadowViewNode.name, ShadowOccluderNode.name)
    renderer.renderGraph.addDependency(ShadowOccluderNode.name, FillViewsNode.name)
    
  }

  /**
   * @override
   */
  preprocess() {}
}
