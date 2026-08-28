import { Affine3, Matrix4, Vector3 } from "hisabati"
import { DirectionalLight, SpotLight, PointLight, PCFShadowFilter, PCSSShadowFilter } from "../../../objects"
import { Object3D, PerspectiveProjection } from "../../../objects"
import { Views, View, ViewBindGroups, ViewBindings } from "../../../renderer"
import { ViewUniformBuffer } from "../../../renderer/resources/index.js"
import { Vector2 } from "../../../math/index.js"
import {
  ShadowCasterUniformBuffer,
  ShadowViewBindings,
  ShadowMap
} from "../resources/index.js"
import { assert, ViewRectangle } from "../../../utils/index.js"
import { BoneTextureResource } from "../../meshmaterial/resources/index.js"

export class ShadowViewNode {
    subgraph() {
      return undefined
    }

    /**
     * @param {import("../../../renderer").RenderGraphContext} graphcontext
     */
    execute(graphcontext){
    const {renderDevice: device, renderer, objects } = graphcontext
    const shadowMap = renderer.getResource(ShadowMap)
    const shadowCasterUniform = renderer.getResource(ShadowCasterUniformBuffer)
    const views = renderer.getResource(Views)
    const viewBindGroups = renderer.getResource(ViewBindGroups)
    const viewUniformBuffer = renderer.getResource(ViewUniformBuffer)
    /** @type {ShadowItem[]}*/
    const blocks = []
    
    assert(shadowMap, "Shadow map not set up.")
    assert(shadowCasterUniform, "ShadowCasterUniformBuffer resource missing")
    assert(views, "Views resource missing")
    assert(viewBindGroups, "ViewBindGroups resource missing")
    assert(viewUniformBuffer, "ViewUniformBuffer resource missing")

    const maxShadowCasters = shadowCasterUniform.capacity
    let shadowCasterOverflow = false

    shadowMap.reset()
    for (let i = 0; i < objects.length && !shadowCasterOverflow; i++) {
      const object = /**@type {Object3D} */ (objects[i]);

      object.traverseDFS((object) => {
        if (blocks.length >= maxShadowCasters) {
          shadowCasterOverflow = true
          return false
        }

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
        items[1].forEach((view) => {
          const object = view.object

          assert(object, "View object missing")
          const viewBindGroup = viewBindGroups.getOrSet(device, object)
          populateShadowViewBindGroup(viewBindGroup, renderer)
        })
        views.push(...items[1])

        return true
      })
    }

    const data = new ArrayBuffer(blocks.length * ShadowCasterUniformBuffer.BlockSize)
    const view = new DataView(data)

    for (let i = 0; i < blocks.length; i++) {
      // SAFETY: The array is dense
      /**@type {ShadowItem}*/(blocks[i]).write(view, i * ShadowCasterUniformBuffer.BlockSize)
    }

    shadowCasterUniform.setData(data)

    if (shadowCasterOverflow) {
      console.error(`Maximum shadow caster capacity reached (${maxShadowCasters}), some shadows will be ignored`)
    }
    }
}

/**
 * @param {import("../../../renderer/resources/viewbindgroup.js").ViewBindGroup} viewBindGroup
 * @param {import("../../../renderer/renderer.js").WebGLRenderer} renderer
 */
function populateShadowViewBindGroup(viewBindGroup, renderer) {
  const viewUniformBuffer = renderer.getResource(ViewUniformBuffer)
  const shadowCasterUniform = renderer.getResource(ShadowCasterUniformBuffer)
  const boneTexture = renderer.getResource(BoneTextureResource)

  assert(viewUniformBuffer, "ViewUniformBuffer resource missing")
  if (shadowCasterUniform) {
    viewBindGroup.setOrReplace(ShadowViewBindings.shadowCasterBlock, shadowCasterUniform.buffer)
  }
  viewBindGroup.setOrReplace(ViewBindings.camera, viewUniformBuffer.buffer)

  if (!boneTexture) {
    return
  }

  viewBindGroup.setOrReplace(ViewBindings.boneTransforms.texture, boneTexture.texture)
  viewBindGroup.setOrReplace(ViewBindings.boneTransforms.sampler, renderer.defaults.textureNearestSampler)
}

/**
 * @param {DirectionalLight} light
 * @param {ShadowMap} shadowMap
 * @returns {[ShadowItem, View[]] | undefined}
 */
function buildDirectionalShadowPass(light, shadowMap) {
  const shadow = light.shadow

  if (!shadow) return

  const allocation = shadowMap.allocate(shadow.resolution, 1)

  if (!allocation) {
    return
  }

  const shadowItem = new ShadowItem()
  const projectionMatrix = shadow.projection.asProjectionMatrix(shadow.near, shadow.far)
  const viewMatrix = Affine3.toMatrix4(light.transform.world).invert()
  const viewport = createViewport(allocation, shadowMap)
  const view = new View({
    viewport,
    scissor: viewport,
    colorLayer: allocation.layer,
    depthLayer: allocation.layer,
    colorMipmapLevel: 0,
    depthMipmapLevel: 0,
    position: light.transform.position,
    projection: projectionMatrix,
    view: viewMatrix,
    near: shadow.near,
    far: shadow.far,
    tag: DirectionalLight.name,
    object: light,
    renderMask: light.renderMask
  })


  writePackedRegion(shadowItem, allocation, shadowMap, shadow)
  packShadowMode(shadowItem,shadow.filterMode)
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
  const allocation = shadowMap.allocate(shadow.resolution, 1)

  if (!allocation) {
    return
  }
  const shadowItem = new ShadowItem()
  const viewMatrix = Affine3.toMatrix4(light.transform.world).invert()
  const projectionMatrix = new PerspectiveProjection(light.outerAngle, 1).asProjectionMatrix(
    shadow.near,
    light.range
  )
  const viewport = createViewport(allocation, shadowMap)
  const view = new View({
    viewport,
    scissor: viewport,
    colorLayer: allocation.layer,
    depthLayer: allocation.layer,
    colorMipmapLevel: 0,
    depthMipmapLevel: 0,
    position: light.transform.position,
    projection: projectionMatrix,
    view: viewMatrix,
    near: shadow.near,
    far: light.range,
    tag: SpotLight.name,
    object: light,
    renderMask: light.renderMask
  })

  writePackedRegion(shadowItem, allocation, shadowMap, shadow)
  packShadowMode(shadowItem, shadow.filterMode)
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
  const allocation = shadowMap.allocate(shadow.resolution, 6)

  if (!allocation) {
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
  const viewport = createViewport(allocation, shadowMap)

  for (let i = 0; i < sides.length; i++) {
    const side = /**@type {[Vector3, Vector3]} */ (sides[i])
    const layer = allocation.layer + i

    const worldMatrix = light.transform.world
    const viewMatrix = Affine3.toMatrix4(new Affine3()
      .lookAt(side[0], side[1])
      .translate(new Vector3(
        worldMatrix.x,
        worldMatrix.y,
        worldMatrix.z
      )))
      .invert()

    views.push(new View({
      viewport,
      scissor: viewport,
      colorLayer: layer,
      depthLayer: layer,
      colorMipmapLevel: 0,
      depthMipmapLevel: 0,
      view: viewMatrix,
      projection: projectionMatrix,
      position: light.transform.position,
      near: shadow.near,
      far: light.radius,
      tag: PointLight.name,
      object: light,
      renderMask: light.renderMask
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
  writePackedRegion(shadowItem, allocation, shadowMap, shadow)
  packShadowMode(shadowItem, shadow.filterMode)

  return [shadowItem, views]
}

/**
 * @param {ShadowItem} item
 * @param {import("../../../objects/light/index.js").ShadowFilteringModes} mode
 */
function packShadowMode(item, mode) {
  if (typeof mode === "undefined") {
    item.mode = 0
  } else if (mode instanceof PCFShadowFilter) {
    item.mode = 1
    item.pcfRadius = mode.radius
  } else if (mode instanceof PCSSShadowFilter) {
    item.mode = 2
    item.pcfRadius = mode.radius
    item.pcssSearchRadius = mode.searchRadius
    item.pcssPenumbra = mode.penumbra
  }else {
    throw new Error("Invalid shadow filtering mode")
  }
}

export class ShadowItem {
  matrix = new Matrix4()
  offset = new Vector2()
  size = new Vector2(1, 1)
  bias = 0.001
  normalBias = 0
  /**
   * 0 = hard compare, 1 = PCF, 2 = PCSS.
   * @type {number}
   */
  mode = 0
  pcfRadius = 0
  pcssSearchRadius = 0
  pcssPenumbra = 0
  layer = 0
  /**
   * @param {DataView} view
   * @param {number} offset
   */
  write(view, offset) {
    let i = 0
    for (const value of this.matrix) {
      view.setFloat32(offset + (i * 4), value, true)
      i++
    }
    view.setFloat32(offset + 64, this.offset.x, true)
    view.setFloat32(offset + 68, this.offset.y, true)
    view.setFloat32(offset + 72, this.size.x, true)
    view.setFloat32(offset + 76, this.size.y, true)
    view.setFloat32(offset + 80, this.bias, true)
    view.setFloat32(offset + 84, this.normalBias, true)
    view.setFloat32(offset + 88, this.layer, true)
    view.setUint32(offset + 92, this.mode >>> 0, true)
    view.setFloat32(offset + 96, this.pcfRadius, true)
    view.setFloat32(offset + 100, this.pcssSearchRadius, true)
    view.setFloat32(offset + 104, this.pcssPenumbra, true)
    view.setFloat32(offset + 108, 0, true)
  }
}

/**
 * @param {{ offset: Vector2, size: Vector2 }} allocation
 * @param {ShadowMap} shadowMap
 * @returns {ViewRectangle}
 */
function createViewport(allocation, shadowMap) {
  const atlasWidth = shadowMap.shadowAtlas.width
  const atlasHeight = shadowMap.shadowAtlas.height
  const viewport = new ViewRectangle()

  viewport.offset.x = allocation.offset.x / atlasWidth
  viewport.offset.y = allocation.offset.y / atlasHeight
  viewport.size.x = allocation.size.x / atlasWidth
  viewport.size.y = allocation.size.y / atlasHeight

  return viewport
}

/**
 * @param {ShadowItem} item
 * @param {{ layer: number, offset: Vector2, size: Vector2 }} allocation
 * @param {ShadowMap} shadowMap
 * @param {{ bias: number, normalBias: number }} shadow
 */
function writePackedRegion(item, allocation, shadowMap, shadow) {
  const atlasWidth = shadowMap.shadowAtlas.width
  const atlasHeight = shadowMap.shadowAtlas.height

  item.layer = allocation.layer
  item.offset.x = allocation.offset.x / atlasWidth
  item.offset.y = allocation.offset.y / atlasHeight
  item.size.x = allocation.size.x / atlasWidth
  item.size.y = allocation.size.y / atlasHeight
  item.bias = shadow.bias
  item.normalBias = shadow.normalBias
}
