import { WebGLRenderDevice } from "../core/index.js";
import { DirectionalLight } from "../light/directional.js";
import { AmbientLight, PointLight, SpotLight } from "../light/index.js";
import { Object3D } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";
import { ShadowMap } from "./shadow.js";

export class LightPlugin extends Plugin {

  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    renderer.defines
      .set("MAX_DIRECTIONAL_LIGHTS", "10")
      .set("MAX_POINT_LIGHTS", "10")
      .set("MAX_SPOT_LIGHTS", "10")
  }
  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, device, renderer) {
    const shadowMap = renderer.getResource(ShadowMap)
    const directionalLights = new LightQueue()
    const pointLights = new LightQueue()
    const spotLights = new LightQueue()
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i])

      object.traverseDFS((object) => {
        if (object instanceof DirectionalLight) {
          directionalLights.add(object)
        } else if (object instanceof PointLight) {
          pointLights.add(object)
        } else if (object instanceof SpotLight) {
          spotLights.add(object)
        } else if (object instanceof AmbientLight) {
          renderer.updateUBO(device.context, object.getData())
        }
        return true
      })
    }

    const directionalLightData = directionalLights.getData()
    const spotLightData = spotLights.getData()
    const directionalItems  = new Int32Array(directionalLightData.buffer)
    const spotItems  = new Int32Array(spotLightData.buffer)
    
    for (let i = 0; i < directionalLights.lights.length; i++) {
      const offset = (i + 1) * 8 + 4;
      const index = shadowMap?.inner.get(/**@type {DirectionalLight}*/(directionalLights.lights[i]))?.spaceIndex ?? -1
      directionalItems[offset] = index
    }

    for (let i = 0; i < spotLights.lights.length; i++) {
      const offset = (i + 1) * 7 + 4;
      const item = shadowMap?.inner.get(/**@type {SpotLight}*/(spotLights.lights[i]))
      const index = item?.spaceIndex ?? -1
      spotItems[offset] = index
    }
    renderer.updateUBO(device.context, {
      name: "DirectionalLightBlock",
      data: directionalLightData
    })

    renderer.updateUBO(device.context, {
      name: "PointLightBlock",
      data: pointLights.getData()
    })

    renderer.updateUBO(device.context, {
      name: "SpotLightBlock",
      data: spotLightData
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
    const buffer = new Float32Array([
      0, 0, 0, 0,
      ...this.lights.flatMap(light => light.pack())
    ])
    const dataView = new Uint32Array(buffer.buffer)

    dataView[0] = this.lights.length

    return buffer
  }
}