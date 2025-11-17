/**@import { RenderTargetDescriptor } from './descriptors.js' */
import { CullFace, FrontFaceDirection, PrimitiveTopology } from "../../constants/index.js";
import { MeshVertexLayout, UniformBufferLayout, Uniform } from "../layouts/index.js";

export class WebGLRenderPipeline {
  /**
   * @param {WebGLRenderPipelineOptions} descriptor
   */
  constructor({
    program,
    targets,
    uniforms,
    uniformBlocks,
    topology,
    vertexLayout,
    depthTest,
    depthWrite,
    cullFace,
    frontFace
  }) {
    this.program = program
    this.uniforms = uniforms
    this.uniformBlocks = uniformBlocks
    this.vertexLayout = vertexLayout
    this.topology = topology
    this.cullMode = cullFace
    this.depthTest = depthTest
    this.depthWrite = depthWrite
    this.frontFace = frontFace
    this.targets = targets
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  use(gl) {
    gl.useProgram(this.program);

    // culling
    if (this.cullMode) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(this.cullMode);
    } else {
      gl.disable(gl.CULL_FACE);
    }

    // depth
    if (this.depthTest) {
      gl.enable(gl.DEPTH_TEST)
    }
    else {
      gl.disable(gl.DEPTH_TEST)
    }
    gl.depthMask(this.depthWrite);

    // blending
    // NOTE: webgl does not have ability to blend differently on 
    // different render targets since state is global.
    const target = this.targets[0]
    if (target && target.blend) {
      const { color, alpha } = target.blend

      gl.enable(gl.BLEND)
      gl.blendEquationSeparate(color.operation, alpha.operation)
      gl.blendFuncSeparate(
        color.source,
        color.destination,
        alpha.source,
        alpha.destination
      )
    } else {
      gl.disable(gl.BLEND);
    }
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  dispose(gl) {
    gl.deleteProgram(this.program)
  }
}

/**
 * @typedef WebGLRenderPipelineOptions
 * @property {WebGLProgram} program
 * @property {Map<string, Uniform>} uniforms
 * @property {Map<string, UniformBufferLayout>} uniformBlocks
 * @property {RenderTargetDescriptor[]} targets
 * @property {MeshVertexLayout} vertexLayout
 * @property {PrimitiveTopology} topology
 * @property {CullFace} cullFace
 * @property {boolean} depthWrite
 * @property {boolean} depthTest
 * @property {FrontFaceDirection} frontFace
 */