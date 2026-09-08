import { Camera } from "../../../objects/index.js"
import { Views } from "../../../renderer/index.js"
import { assert } from "../../../utils/index.js"
import { CameraColorTargets } from "../resources/index.js"
import { FogPipeline, FogUniform } from "../resources/index.js"

/**
 * Fog postprocess node.
 */
export class FogNode {
  subgraph() {
    return undefined
  }

  /**
   * @param {import("../../../renderer/graph/index.js").RenderGraphContext} context
   */
  execute(context) {
    const { renderer, renderDevice } = context
    const views = renderer.getResource(Views)
    const colorTargets = renderer.getResource(CameraColorTargets)
    const pipelineState = renderer.getResource(FogPipeline)
    const fogUniform = renderer.getResource(FogUniform)

    assert(views, "Views resource missing")
    assert(colorTargets, "Camera color targets resource missing")
    assert(pipelineState, "FogPipeline resource missing")
    assert(fogUniform, "FogUniform resource missing")

    const commandEncoder = renderDevice.createCommandEncoder()
    const actualViews = views.items()
    const pipeline = renderer.caches.getRenderPipeline(pipelineState.pipelineId)

    assert(pipeline, "Fog pipeline missing")

    for (const view of actualViews) {

      if (!(view.object instanceof Camera)) {
        continue
      }

      const fog = view.object.fog
      if (!fog) {
        continue
      }

      const cameraColorTarget = colorTargets.get(view.object)
      if (!cameraColorTarget) {
        continue
      }

      const sourceColor = cameraColorTarget.readTarget
      const depthTexture = view.depthTexture ? renderer.caches.getTexture(renderDevice, view.depthTexture) : undefined

      if (!depthTexture) {
        continue
      }

      const sourceTexture = renderer.caches.getTexture(renderDevice, sourceColor)
      const sampler = renderer.caches.getSampler(renderDevice, renderer.defaults.textureNearestSampler)
      const dynamicOffset = fogUniform.getOffset(view.object)

      if (dynamicOffset === undefined) {
        continue
      }

      const fogBuffer = renderer.caches.getUniformBuffer(renderDevice, fogUniform.buffer)
      const bindGroup = createFogBindGroup(
        renderDevice,
        pipelineState,
        fogBuffer,
        fogUniform.bindingSize,
        sourceTexture,
        depthTexture,
        sampler
      )

      const [, outputColor] = cameraColorTarget.getColorPair()

      const pass = commandEncoder.beginRenderPass({
        width: outputColor.width,
        height: outputColor.height,
        colorAttachments: [{
          texture: renderer.caches.getTexture(renderDevice, outputColor),
          layer: 0,
          loadOp: "load",
          storeOp: "store"
        }]
      })

      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bindGroup, [dynamicOffset])
      pass.draw(3)
      pass.end()
    }
  }
}

/**
 * @param {import("../../../core/index.js").WebGLRenderDevice} device
 * @param {FogPipeline} pipelineState
 * @param {import("../../../core/resources/index.js").GPUBuffer} fogBuffer
 * @param {number} fogBindingSize
 * @param {import("../../../core/resources/index.js").GPUTexture} sceneTexture
 * @param {import("../../../core/resources/index.js").GPUTexture} depthTexture
 * @param {import("../../../core/resources/index.js").GPUSampler} sampler
 */
function createFogBindGroup(device, pipelineState, fogBuffer, fogBindingSize, sceneTexture, depthTexture, sampler) {
  return device.createBindGroup({
    label: "FogBindGroup",
    layout: pipelineState.bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: fogBuffer,
          size: fogBindingSize
        }
      },
      {
        binding: 1,
        resource: {
          texture: sceneTexture
        }
      },
      {
        binding: 2,
        resource: {
          sampler
        }
      },
      {
        binding: 3,
        resource: {
          texture: depthTexture
        }
      },
      {
        binding: 4,
        resource: {
          sampler
        }
      }
    ]
  })
}
