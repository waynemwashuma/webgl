import { BlendEquation, CullFace, FrontFaceDirection, PrimitiveTopology } from "../constant.js";
import { createProgramFromSrc } from "../function.js";
import { Attribute } from "./attribute/attribute.js";
import { UBOs } from "./ubo.js";

export class WebGLRenderPipeline {
  /**
   * @param {WebGLRenderPipelineDescriptor} descriptor
   */
  constructor({
    ubos,
    context,
    attributes,
    vertex,
    fragment,
    topology,
    vertexLayout,
    depthTest = true,
    depthWrite = true,
    cullFace = CullFace.Back,
    frontFace = FrontFaceDirection.CCW,
    blend
  }) {
    const programInfo = createProgramFromSrc(
      context,
      vertex,
      fragment,
      attributes
    )
    this.program = programInfo.program
    this.uniforms = programInfo.uniforms
    this.uniformBlocks = programInfo.uniformBlocks
    this.vertexLayout = vertexLayout
    this.topology = topology
    this.cullMode = cullFace
    this.depthTest = depthTest
    this.depthWrite = depthWrite
    this.frontFace = frontFace
    this.blend = blend

    for (const [name, uboLayout] of this.uniformBlocks) {
      const ubo = ubos.getorSet(context, name, uboLayout)
      const index = context.getUniformBlockIndex(this.program, name)

      context.uniformBlockBinding(this.program, index, ubo.point)
    }
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
    if (this.blend) {
      const { source, destination } = this.blend;
      gl.enable(gl.BLEND);
      gl.blendFunc(source, destination);
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
 * @typedef WebGLRenderPipelineDescriptor
 * @property {WebGL2RenderingContext} context
 * @property {ReadonlyMap<string,Attribute>} attributes
 * @property {UBOs} ubos
 * @property {string} vertex
 * @property {string} fragment
 * @property {VertexLayout} vertexLayout
 * @property {PrimitiveTopology} topology
 * @property {CullFace} [cullFace]
 * @property {boolean} [depthWrite]
 * @property {boolean} [depthTest]
 * @property {FrontFaceDirection} [frontFace]
 * @property {BlendDescriptor} [blend]
 */

/**
 * @typedef BlendDescriptor
 * @property {BlendEquation} source
 * @property {BlendEquation} destination
 */

export class VertexLayout {
  /**
   * @type {readonly Attribute[]}
   */
  attributes = []
}

/**
 * @typedef ShaderDescriptor
 * @property {Map<string,string>} defines
 * @property {string} source
 */