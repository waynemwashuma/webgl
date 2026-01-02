/**@import { GPUMesh, WebGLRenderPipelineDescriptor } from '../core/index.js' */
/** @import { ViewFiller } from "../renderer/index.js" */
import { View } from "../renderer/index.js";
import { PrimitiveTopology, TextureFilter, TextureFormat, TextureType, TextureWrap } from "../constants/index.js";
import { Shader, WebGLRenderDevice } from "../core/index.js";
import { DirectionalLight, PointLight, SpotLight } from "../light/index.js";
import { Affine3, Matrix4, Vector3 } from "../math/index.js";
import { MeshMaterial3D, Object3D, PerspectiveProjection } from "../objects/index.js";
import { Plugin, RenderItem, WebGLRenderer } from "../renderer/index.js";
import { ImageRenderTarget } from "../rendertarget/index.js";
import { basicVertex } from "../shader/index.js";
import { Sampler, Texture } from "../texture/index.js";
import { assert } from "../utils/index.js";

export class ShadowPlugin extends Plugin {

  /**
   * Layout hash is the key, pipeline id the value
   * @package
   * @type {Map<number, number>}
   */
  // TODO: Refactor into a resource `ShadowPipelines`
  pipelines = new Map()

  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    const maxShadows = 10
    renderer.setResource(new ShadowMap(maxShadows))
    renderer.defines.set('MAX_SHADOW_CASTERS', maxShadows.toString())
    renderer.viewFiller
      .set(DirectionalLight.name, fillShadowCameraView.bind(this))
      .set(PointLight.name, fillShadowCameraView.bind(this))
      .set(SpotLight.name, fillShadowCameraView.bind(this))
  }

  /**
   * @override
   * @param {Object3D[]} objects
   * @param {WebGLRenderDevice} device
   * @param {WebGLRenderer} renderer
   */
  preprocess(objects, device, renderer) {
    const { context } = device
    const shadowMap = renderer.getResource(ShadowMap)
    /** @type {ShadowItem[]}*/
    const blocks = []

    assert(shadowMap, "Shadow map not set up.")

    shadowMap.reset()
    for (let i = 0; i < objects.length; i++) {
      const object = /**@type {Object3D} */ (objects[i]);

      object.traverseDFS((object) => {
        const area = shadowMap.getOrSet(object)
        const items = object instanceof DirectionalLight ?
          buildDirectionalShadowPass(object, shadowMap) :
          object instanceof SpotLight ?
            buildSpotShadowPass(object, shadowMap) :
            object instanceof PointLight ?
              buildPointShadowPass(object, shadowMap) :
              undefined

        if (!items) {
          return true
        }

        area.enabled = true
        area.spaceIndex = blocks.length
        blocks.push(items[0])
        items[1].forEach(e => e.order = -100)
        renderer.views.push(...items[1])

        return true
      })
    }

    renderer.updateUBO(context, {
      name: "ShadowCasterBlock",
      data: new Float32Array(blocks.flatMap(item => item.pack()))
    })
  }
}

/**
 * @param {DirectionalLight} light
 * @param {ShadowMap} shadowMap
 * @returns {[ShadowItem, View[]] | undefined}
 */
function buildDirectionalShadowPass(light, shadowMap) {
  const shadow = light.shadow

  if (!shadow) return

  const [renderTarget, layer] = shadowMap.getTarget()
  const shadowItem = new ShadowItem()
  const projectionMatrix = shadow.projection.asProjectionMatrix(shadow.near, shadow.far)
  const viewMatrix = Affine3.toMatrix4(light.transform.world).invert()
  const view = new View({
    renderTarget,
    position: light.transform.position,
    projection: projectionMatrix,
    view: viewMatrix,
    near: shadow.near,
    far: shadow.far,
    tag: DirectionalLight.name
  })


  shadowItem.layer = layer
  shadowItem.bias = shadow.bias
  shadowItem.normalBias = shadow.normalBias
  Matrix4.multiply(projectionMatrix, viewMatrix, shadowItem.matrix)

  return [shadowItem, [view]]
}

/**
 * @param {SpotLight} light
 * @param {ShadowMap} shadowMap
 * @returns {[ShadowItem, View[]] | undefined}
 */
function buildSpotShadowPass(light, shadowMap) {
  const shadow = light.shadow

  if (!shadow) {
    return
  }
  const [renderTarget, layer] = shadowMap.getTarget()
  const shadowItem = new ShadowItem()
  const viewMatrix = Affine3.toMatrix4(light.transform.world).invert()
  const projectionMatrix = new PerspectiveProjection(light.outerAngle, 1).asProjectionMatrix(
    shadow.near,
    light.range
  )
  const view = new View({
    renderTarget,
    position: light.transform.position,
    projection: projectionMatrix,
    view: viewMatrix,
    near: shadow.near,
    far: light.range,
    tag: SpotLight.name
  })

  shadowItem.layer = layer
  shadowItem.bias = shadow.bias
  shadowItem.normalBias = shadow.normalBias
  Matrix4.multiply(projectionMatrix, viewMatrix, shadowItem.matrix)

  return [shadowItem, [view]]
}

/**
 * @param {PointLight} light
 * @param {ShadowMap} shadowMap
 * @returns {[ShadowItem, View[]] | undefined}
 * 
 */
function buildPointShadowPass(light, shadowMap) {
  const shadow = light.shadow

  if (!shadow) {
    return
  }
  const shadowItem = new ShadowItem()
  const sides = [
    [Vector3.X, Vector3.NegY],
    [Vector3.NegX, Vector3.NegY],
    [Vector3.Y, Vector3.Z],
    [Vector3.NegY, Vector3.NegZ],
    [Vector3.Z, Vector3.NegY],
    [Vector3.NegZ, Vector3.NegY]
  ]
  const projectionMatrix = new PerspectiveProjection(Math.PI / 2, 1).asProjectionMatrix(
    shadow.near,
    light.radius
  )
  const views = []
  let layerId = 0

  for (let i = 0; i < sides.length; i++) {
    const side = /**@type {[Vector3, Vector3]} */ (sides[i])
    const [renderTarget, layer] = shadowMap.getTarget()

    const worldMatrix = light.transform.world
    const viewMatrix = Affine3.toMatrix4(new Affine3()
      .lookAt(side[0], side[1])
      .translate(new Vector3(
        worldMatrix.x,
        worldMatrix.y,
        worldMatrix.z
      )))
      .invert()

    layerId = layer
    views.push(new View({
      renderTarget,
      view: viewMatrix,
      projection: projectionMatrix,
      position: light.transform.position,
      near: shadow.near,
      far: light.radius,
      tag: PointLight.name
    }))
  }

  // Encode clipping planes as they are neccessary for point light shadows
  // Will be unpacked in the corresponding shader
  shadowItem.matrix.a = shadow.near;
  shadowItem.matrix.b = light.radius;

  // We only need the light position for point lights
  shadowItem.matrix.m = light.transform.world.x
  shadowItem.matrix.n = light.transform.world.y
  shadowItem.matrix.o = light.transform.world.z
  shadowItem.bias = shadow.bias
  shadowItem.normalBias = shadow.normalBias
  shadowItem.layer = layerId - 5

  return [shadowItem, views]
}

/**
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {GPUMesh} mesh
 * @param {Map<number, number>} pipelines
 * @returns {number}
 */
function getRenderPipelineId(device, renderer, mesh, pipelines) {
  const { caches, includes, defines: globalDefines } = renderer
  const pipelineid = pipelines.get(mesh.layoutHash)

  if (pipelineid !== undefined) {
    return pipelineid
  }

  const layout = caches.getMeshVertexLayout(mesh.layoutHash)

  assert(layout, "Invalid mesh layout")
  /**
   * @type {WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    //cullFace:CullFace.None,
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
  const [_, newId] = caches.createRenderPipeline(device, descriptor)

  pipelines.set(mesh.layoutHash, newId)
  return newId
}

/**
 * @this {ShadowPlugin}
 * @type {ViewFiller}
 */
function fillShadowCameraView(device, renderer, objects, _plugins, view) {
  /**@type {RenderItem[]} */
  const opaqueStage = []
  for (let i = 0; i < objects.length; i++) {
    const object = /**@type {Object3D} */ (objects[i])
    object.traverseDFS((child) => {
      if (!(child instanceof MeshMaterial3D)) {
        return true
      }
      const gpuMesh = renderer.caches.getMesh(device, child.mesh, renderer.attributes)
      const item = new RenderItem({
        pipelineId: getRenderPipelineId(device, renderer, gpuMesh, this.pipelines),
        transform: child.transform.world,
        mesh: gpuMesh,
        uniforms: {},
        tag: ""
      })

      opaqueStage.push(item)
      return true
    })
  }
  view.renderStage.opaque = opaqueStage
}

export class ShadowMap {

  /**
   * @private
   */
  counter = 0
  /**
   * @type {ImageRenderTarget[]}
   */
  targets = []

  shadowAtlas = new Texture({
    type: TextureType.Texture2DArray,
    format: TextureFormat.Depth32Float
  })

  sampler = new Sampler({
    wrapR: TextureWrap.Clamp,
    wrapS: TextureWrap.Clamp,
    wrapT: TextureWrap.Clamp,
    minificationFilter: TextureFilter.Nearest,
    magnificationFilter: TextureFilter.Nearest,
    mipmapFilter: undefined
  })

  maxDepth = 10

  /**
   * @param {number} maxShadows
   */
  constructor(maxShadows) {
    this.maxDepth = maxShadows
  }

  /**
   * @type {Map<Object3D, ShadowArea>}
   */
  inner = new Map()

  reset() {
    this.counter = 0
    this.inner.forEach((area) => {
      area.enabled = false
    })
  }
  /**
   * @return {[ImageRenderTarget, number]}
   */
  getTarget() {
    const layer = this.counter
    const target = this.targets[layer]

    if (this.counter > this.maxDepth) {
      console.error('Maximum shadows reached, some shadows will be ignored');
    }

    this.counter++
    if (target) {
      return [target, layer]
    }

    const newTarget = new ImageRenderTarget({
      depthTexture: this.shadowAtlas,
      width: 2048,
      height: 2048,
      depth: this.maxDepth,
      layer: layer
    })
    this.targets[layer] = newTarget

    return [newTarget, layer]
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
  enabled = false
  spaceIndex = -1
}

export class ShadowItem {
  matrix = new Matrix4()
  bias = 0.001
  normalBias = 0
  layer = 0
  pack() {
    return [
      ...this.matrix,
      this.bias,
      this.normalBias,
      this.layer,
      0
    ]
  }
}