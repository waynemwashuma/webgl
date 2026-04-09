import { FillViewsNode, Plugin, View, Views, WebGLRenderer } from "../../renderer/index.js";
import { Camera, Object3D } from "../../objects/index.js";
import { Vector3 } from "../../math/index.js";
import { assert } from "../../utils/index.js";

export class CameraPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer){
    renderer.renderGraph.addNode(CameraViewNode.name, new CameraViewNode())
    renderer.renderGraph.addDependency(CameraViewNode.name, FillViewsNode.name)
  }
  /**
   * @override
   */
  preprocess() {}
}

export class CameraViewNode {
  /**
   * @param {import("../../renderer/graph/index.js").RenderGraphContext} context
   */
  execute(context) {
    const { objects, renderer } = context
    const views = renderer.getResource(Views)

    assert(views, "Views resource missing")
    for (let i = 0; i < objects.length; i++) {
      const camera = /**@type {Object3D} */(objects[i])

      if (!(camera instanceof Camera)) {
        continue
      }

      const position = new Vector3(
        camera.transform.world.x,
        camera.transform.world.y,
        camera.transform.world.z
      )
      const cameraView = new View({
        renderTarget: camera.target,
        near: camera.near,
        far: camera.far,
        projection: camera.projection.asProjectionMatrix(camera.near, camera.far),
        view: camera.view,
        position,
        tag: Camera.name,
        object: camera
      })

      views.push(cameraView)
    }
  }
}
