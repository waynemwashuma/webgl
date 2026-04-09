import { Plugin, RenderViewsNode, SortViewsNode, WebGLRenderer } from "../../renderer/index.js";
import { CameraNode, CameraViewNode } from "./nodes/index.js";

export class CameraPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer){
    renderer.renderGraph.addNode(CameraViewNode.name, new CameraViewNode())
    renderer.renderGraph.addNode(CameraNode.name, new CameraNode())
    renderer.renderGraph.addDependency(CameraViewNode.name, SortViewsNode.name)
    renderer.renderGraph.addDependency(RenderViewsNode.name, CameraNode.name)
  }
  /**
   * @override
   */
  preprocess() {}
}
