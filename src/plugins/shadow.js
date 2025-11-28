/**@import { GPUMesh, WebGLRenderPipelineDescriptor } from '../core/index.js' */
import { PrimitiveTopology, TextureFormat, TextureType } from "../constants/index.js";
import { Shader, WebGLRenderDevice, WebGLRenderPipeline } from "../core/index.js";
import { DirectionalLight } from "../light/directional.js";
import { OrthographicShadow, SpotLight, SpotLightShadow } from "../light/index.js";
import { Affine3, Matrix4 } from "../math/index.js";
import { MeshMaterial3D, Object3D, PerspectiveProjection, SkyBox } from "../objects/index.js";
import { Plugin, WebGLRenderer } from "../renderer/index.js";
import { ImageRenderTarget } from "../rendertarget/image.js";
import { basicVertex } from "../shader/index.js";
import { Texture } from "../texture/index.js";
import { assert } from "../utils/index.js";

export class ShadowPlugin extends Plugin {

  /**
   * Layout hash is the key, pipeline id the value
   * @private
   * @type {Map<number, number>}
   */
  pipelines = new Map()

  /**
   * @type {Object3D[]}
   */
  lights = []

  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, device, renderer) {
    const { context } = device
    const shadowMap = renderer.getResource(ShadowMap)
    shadowMap?.inner.clear()
    /** @type {ShadowItem[]}*/
    const blocks = []

    assert(shadowMap, "Shadow map not set up.")
    
    const { target: renderTarget } = shadowMap
    const framebuffer = renderer.caches.getFrameBuffer(device, renderTarget)

    framebuffer.setViewport(context, renderTarget.viewport, renderTarget.scissor || renderTarget.viewport)
    framebuffer.clear(context, undefined, 1, undefined)
    this.lights = []

    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i]);

      object.traverseDFS((object) => {
        if (
          object instanceof DirectionalLight &&
          object.shadow
        ) {
          this.lights.push(object)
        } else if(
          object instanceof SpotLight &&
          object.shadow
        ){
          this.lights.push(object)
        }
        return true
      })
    }

    for (let i = 0; i < this.lights.length; i++) {
      const light = /**@type {Object3D} */ (this.lights[i]);

      if (light instanceof DirectionalLight) {
        const area = shadowMap.getOrSet(light)
        const item = processDirectionalLight(light, objects, renderer, device, this.pipelines)

        blocks[i] = item
        area.spaceIndex = i
      } else if (light instanceof SpotLight) {
        const area = shadowMap.getOrSet(light)
        const item = processSpotLight(light, objects, renderer, device, this.pipelines)

        blocks[i] = item
        area.spaceIndex = i
      }
    }

    renderer.updateUBO(context, {
      name:"ShadowCasterBlock",
      data: new Float32Array(blocks.flatMap(item=>item.pack()))
    })
  }

  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    renderer.setResource(new ShadowMap())
    renderer.defines.set('MAX_SHADOW_CASTERS', '10')
  }

  /**
   * @override
   */
  renderObject3D() { }
}

/**
 * @param {DirectionalLight} light
 * @param {Object3D[]} objects
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderDevice} device
 * @param {Map<number, number>} pipelines
 */
function processDirectionalLight(light, objects, renderer, device, pipelines) {
  // SAFETY: If it is in the light list, it has a shadow.
  const shadow = /**@type {OrthographicShadow}*/ (light.shadow)
  const shadowItem = new ShadowItem()
  const projection = shadow.projection.asProjectionMatrix(shadow.near, shadow.far)
  const view = Affine3.toMatrix4(light.transform.world).invert()

  shadowItem.bias = shadow.bias
  shadowItem.normalBias = shadow.normalBias
  Matrix4.multiply(projection, view, shadowItem.matrix)

  renderer.updateUBO(device.context, {
    name: "CameraBlock",
    data: new Float32Array([
      ...view,
      ...projection,
      ...light.transform.position,
      shadow.near,
      shadow.far
    ]).buffer
  })
  for (let i = 0; i < objects.length; i++) {
    const object = /**@type {Object3D} */ (objects[i]);
    object.traverseDFS((mesh) => {
      if (!(mesh instanceof MeshMaterial3D) || mesh instanceof SkyBox) {
        return true
      }
      const gpuMesh = renderer.caches.getMesh(device, mesh.mesh, renderer.attributes)
      const pipeline = getRenderPipeline(device, renderer, gpuMesh, pipelines)
      const modelInfo = pipeline.uniforms.get('model')
      const modeldata = new Float32Array([...Affine3.toMatrix4(mesh.transform.world)])

      pipeline.use(device.context)
      if (modelInfo) {
        device.context.uniformMatrix4fv(modelInfo.location, false, modeldata)
      }
      //drawing
      device.context.bindVertexArray(gpuMesh.inner)
      if (gpuMesh.indexType !== undefined) {
        device.context.drawElements(
          pipeline.topology,
          gpuMesh.count,
          gpuMesh.indexType, 0
        )
      } else {
        device.context.drawArrays(pipeline.topology, 0, gpuMesh.count)
      }
      return true
    })
  }

  return shadowItem
}

/**
 * @param {SpotLight} light
 * @param {Object3D[]} objects
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderDevice} device
 * @param {Map<number, number>} pipelines
 */
function processSpotLight(light, objects, renderer, device, pipelines) {
  // SAFETY: If it is in the light list, it has a shadow.
  const shadow = /**@type {SpotLightShadow}*/ (light.shadow)
  const shadowItem = new ShadowItem()
  const view = Affine3.toMatrix4(light.transform.world).invert()
  const projection = new PerspectiveProjection(light.outerAngle, 1).asProjectionMatrix(
    shadow.near,
    light.range
  )

  shadowItem.bias = shadow.bias
  shadowItem.normalBias = shadow.normalBias
  Matrix4.multiply(projection, view, shadowItem.matrix)

  renderer.updateUBO(device.context, {
    name: "CameraBlock",
    data: new Float32Array([
      ...view,
      ...projection,
      ...light.transform.position,
      shadow.near,
      light.range
    ]).buffer
  })
  for (let i = 0; i < objects.length; i++) {
    const object = /**@type {Object3D} */ (objects[i]);
    object.traverseDFS((mesh) => {
      if (!(mesh instanceof MeshMaterial3D) || mesh instanceof SkyBox) {
        return true
      }
      const gpuMesh = renderer.caches.getMesh(device, mesh.mesh, renderer.attributes)
      const pipeline = getRenderPipeline(device, renderer, gpuMesh, pipelines)
      const modelInfo = pipeline.uniforms.get('model')
      const modeldata = new Float32Array([...Affine3.toMatrix4(mesh.transform.world)])

      pipeline.use(device.context)
      if (modelInfo) {
        device.context.uniformMatrix4fv(modelInfo.location, false, modeldata)
      }
      //drawing
      device.context.bindVertexArray(gpuMesh.inner)
      if (gpuMesh.indexType !== undefined) {
        device.context.drawElements(
          pipeline.topology,
          gpuMesh.count,
          gpuMesh.indexType, 0
        )
      } else {
        device.context.drawArrays(pipeline.topology, 0, gpuMesh.count)
      }
      return true
    })
  }

  return shadowItem
}

/**
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {GPUMesh} mesh
 * @returns {WebGLRenderPipeline}
 * @param {Map<number, number>} pipelines
 */
function getRenderPipeline(device, renderer, mesh, pipelines) {
  const { caches, includes, defines: globalDefines } = renderer
  const pipelineid = pipelines.get(mesh.layoutHash)

  if (pipelineid !== undefined) {
    const pipeline = renderer.caches.getRenderPipeline(pipelineid)

    assert(pipeline, "Invalid pipeline id for the shadow variant.")
    return pipeline
  }

  const layout = caches.getMeshVertexLayout(mesh.layoutHash)

  assert(layout, "Invalid mesh layout")
  /**
   * @type {WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    depthWrite: true,
    topology: PrimitiveTopology.Triangles,
    vertexLayout: layout,
    vertex: new Shader({
      source: basicVertex
    })
  }


  for (const [name, value] of globalDefines) {
    descriptor.vertex.defines.set(name, value)
    descriptor.fragment?.source?.defines?.set(name, value)
  }
  for (const [name, value] of includes) {
    descriptor.vertex.includes.set(name, value)
    descriptor.fragment?.source?.includes?.set(name, value)
  }
  const [newRenderPipeline, newId] = caches.createRenderPipeline(device, descriptor)

  pipelines.set(mesh.layoutHash, newId)
  return newRenderPipeline
}

export class ShadowMap {
  shadowAtlas = new Texture({
    type: TextureType.Texture2D,
    format: TextureFormat.Depth32Float
  })

  /**
   * @type {ImageRenderTarget}
   */
  target
  /**
   * @type {Map<Object3D, ShadowArea>}
   */
  inner = new Map()

  constructor() {
    this.target = new ImageRenderTarget({
      depthTexture: this.shadowAtlas,
      width: 2048,
      height: 2048
    })
  }
  /**
   * @param {Object3D} object 
   */
  getOrSet(object) {
    const item = this.inner.get(object)

    if (item) {
      return item
    }

    const newItem = new ShadowArea()

    this.inner.set(object, newItem)
    return newItem
  }
}
export class ShadowArea {
  spaceIndex = -1
}

export class ShadowItem {
  matrix = new Matrix4()
  bias = 0.001
  normalBias = 0
  pack(){
    return [
      ...this.matrix,
      this.bias,
      this.normalBias,
      0,
      0
    ]
  }
}