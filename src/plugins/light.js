import { WebGLRenderDevice } from "../core/index.js";
import { DirectionalLight } from "../light/directional.js";
import { AmbientLight } from "../light/index.js";
import { Object3D } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";

export class LightPlugin extends Plugin {

  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer){
    renderer.defines.set("MAX_DIRECTIONAL_LIGHTS", "10")
  }
  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, device, renderer) {
    const directionalLights = new LightQueue()
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])

      object.traverseDFS((object) => {
        if (object instanceof DirectionalLight) {
          directionalLights.add(object)
        } else if (object instanceof AmbientLight) {
          renderer.updateUBO(device.context, object.getData())
        }
        return true
      })
    }
    renderer.updateUBO(device.context, {
      name: "DirectionalLightBlock",
      data: directionalLights.getData()
    })
  }

  /**
   * @override
   */
  renderObject3D() { }
}

/**
 * @template {{pack:()=>number[]}} T
 */
export class LightQueue {
  /**
   * @type {T[]}
   */
  lights = []

  /**
   * @param {T} light
   */
  add(light) {
    this.lights.push(light)
  }
  
  getData() {
    const buffer = [
      this.lights.length,
      0, 0, 0,
      ...this.lights.flatMap(light => light.pack())
    ]

    return new Float32Array(buffer)
  }
}