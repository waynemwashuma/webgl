import { Plugin, SortViewsNode, WebGLRenderer } from "../../renderer/index.js";
import { ShadowMap, ShadowPipelines } from "./resources/index.js";
import { ShadowOccluderNode, ShadowViewNode } from "./nodes/index.js";
import { CameraNode } from "../camera/index.js";

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
    renderer.renderGraph.addDependency(ShadowOccluderNode.name, SortViewsNode.name)
    renderer.renderGraph.addDependency(SortViewsNode.name, CameraNode.name)
    
  }

  /**
   * @override
   */
  preprocess() {}
}
