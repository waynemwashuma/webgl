/** @import { WebGLRenderDevice } from "../../../core/index.js" */
import { CompareFunction, MeshVertexLayout, Shader } from "../../../core/index.js"
import { CullFace, PrimitiveTopology, TextureFormat } from "../../../constants/index.js"
import { fogFragment, fullscreenVertex } from "../../../shader/index.js"
import { FogUniform } from "./foguniform.js"

export class FogPipeline {
  /**
   * @type {number}
   */
  pipelineId

  /**
   * @readonly
   * @type {import("../../../core/layouts/bindgroup.js").WebGLBindGroupLayout}
   */
  bindGroupLayout

  /**
   * @param {import("../../../renderer/renderer.js").WebGLRenderer} renderer
   * @param {WebGLRenderDevice} renderDevice
   */
  constructor(renderer, renderDevice) {
    this.bindGroupLayout = renderDevice.createBindGroupLayout({
      label: "FogBindGroupLayout",
      entries: [
        {
          binding: 0,
          name: "FogBlock",
          visibility: 0,
          buffer: {
            type: "uniform",
            hasDynamicOffset: true,
            minBindingSize: FogUniform.getBindingSize(renderDevice)
          }
        },
        {
          binding: 1,
          name: "sceneTexture",
          visibility: 0,
          texture: {
            viewDimension: "2d",
            sampleType: "float"
          }
        },
        {
          binding: 2,
          name: "sceneTexture",
          visibility: 0,
          sampler: {
            type: "filtering"
          }
        },
        {
          binding: 3,
          name: "depthTexture",
          visibility: 0,
          texture: {
            viewDimension: "2d",
            sampleType: "depth"
          }
        },
        {
          binding: 4,
          name: "depthTexture",
          visibility: 0,
          sampler: {
            type: "filtering"
          }
        }
      ]
    })

    this.pipelineId = createFogPipeline(renderDevice, renderer, this.bindGroupLayout)
  }
}

/**
 * @param {WebGLRenderDevice} device
 * @param {import("../../../renderer/renderer.js").WebGLRenderer} renderer
 * @param {import("../../../core/layouts/bindgroup.js").WebGLBindGroupLayout} bindGroupLayout
 * @returns {number}
 */
function createFogPipeline(device, renderer, bindGroupLayout) {
  const vertexShader = new Shader({
    source: fullscreenVertex,
    defines: new Map(renderer.defines),
    includes: new Map(renderer.includes)
  })
  const fragmentShader = new Shader({
    source: fogFragment,
    defines: new Map(renderer.defines),
    includes: new Map(renderer.includes)
  })

  /**
   * @type {import("../../../core/index.js").WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    depthWrite: false,
    depthCompare: CompareFunction.Always,
    cullFace: CullFace.None,
    topology: PrimitiveTopology.Triangles,
    vertexLayout: new MeshVertexLayout([]),
    vertex: device.createShaderModule({
      code: vertexShader.compile(),
      stage: "vertex"
    }),
    fragment: {
      source: device.createShaderModule({
        code: fragmentShader.compile(),
        stage: "fragment"
      }),
      targets: [{
        format: TextureFormat.RGBA16Float
      }]
    }
  }

  const [pipeline, newId] = renderer.caches.createRenderPipeline(device, descriptor)
  pipeline.layout.setBindGroupLayout(0, bindGroupLayout)
  return newId
}
