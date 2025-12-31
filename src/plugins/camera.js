/** @import { ViewFiller } from "../renderer/index.js"; */
import { Plugin, View, WebGLRenderer } from "../renderer/index.js";
import { WebGLRenderDevice } from "../core/index.js";
import { Camera, Object3D } from "../objects/index.js";
import { Vector3 } from "../math/index.js";

export class CameraPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer){
    renderer.viewFiller.set(Camera.name, fillCameraView)
  }
  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} _device
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, _device, renderer) {
    for (let i = 0; i < objects.length; i++) {
      const camera = /**@type {Object3D} */(objects[i]);
      
      if(!(camera instanceof Camera)){
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
        tag: Camera.name
      })
  
      renderer.views.push(cameraView)
    }
  }
  /**
   * @override
   */
  renderObject3D(){}
}

/**
 * @type {ViewFiller}
 */
function fillCameraView(device, renderer, objects, plugins, view) {
  for (let i = 0; i < plugins.length; i++) {
    const plugin = /**@type {Plugin} */(plugins[i]);
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])
      object.traverseDFS((child) => {
        const item = plugin.getRenderItem(child, device, renderer)

        if (item) {
          view.renderList.push(item)
        }
        return true
      })
    }
  }
}