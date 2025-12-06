import { DirectionalLight } from "../light/directional.js";
import { AmbientLight } from "../light/index.js";
import { Object3D } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";

export class LightPlugin extends Plugin {

  /**
   * @override
   * @param {WebGL2RenderingContext} _context
   * @param {WebGLRenderer} renderer
   */
  init(_context, renderer){
    renderer.defines.set("MAX_DIRECTIONAL_LIGHTS", "10")
  }
  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGL2RenderingContext} context
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, context, renderer) {
    const directionalLights = new DirectionalLights()
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])

      object.traverseDFS((object) => {
        if (object instanceof DirectionalLight) {
          directionalLights.add(object)
        } else if (object instanceof AmbientLight) {
          renderer.updateUBO(context, object.getData())
        }
        return true
      })
    }
    renderer.updateUBO(context, directionalLights.getData())
  }

  /**
   * @override
   */
  renderObject3D() { }
}

export class DirectionalLights {
  /**
   * @type {DirectionalLight[]}
   */
  lights = []
  maxNumber = 10

  /**
   * @param {DirectionalLight} light
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

    return {
      name: "DirectionalLightBlock",
      data: new Float32Array(buffer)
    }
  }
}