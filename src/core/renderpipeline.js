import { BlendEquation, BlendMode, CullFace, FrontFaceDirection, PrimitiveTopology, TextureFormat } from "../constant.js";
import { createProgramFromSrc } from "../function.js";
import { Attribute } from "./attribute/attribute.js";
import { Shader } from "./shader.js";
import { UBOs } from "./ubo.js";

export class BlendParams {
  /**
   * @type {BlendEquation}
   */
  operation
  /**
   * @type {BlendMode}
   */
  source
  /**
   * @type {BlendMode}
   */
  destination

  /**
   * @param {BlendEquation} operation
   * @param {BlendMode} source
   * @param {BlendMode} destination
   */
  constructor(operation, source, destination) {
    this.operation = operation
    this.source = source
    this.destination = destination
  }

  clone(){
    return new BlendParams(
      this.operation,
      this.source,
      this.destination,
    )
  }

  static Opaque = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.Zero
  ))

  static AlphaBlend = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.SrcAlpha,
    BlendMode.OneMinusSrcAlpha,
  ))

  static PremultiplyAlpha = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.OneMinusSrcAlpha,
  ))

  static AdditiveAlpha = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.SrcAlpha,
    BlendMode.One,
  ))

  static AdditiveColor = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.One,
  ))

  static Multiply = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.DstColor,
    BlendMode.Zero,
  ))

  static Screen = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.OneMinusDstColor,
    BlendMode.One,
  ))

  static Min = Object.freeze(new BlendParams(
    BlendEquation.Min,
    BlendMode.One,
    BlendMode.One,
  ))

  static Max = Object.freeze(new BlendParams(
    BlendEquation.Max,
    BlendMode.One,
    BlendMode.One,
  ))
}
export class WebGLRenderPipeline {
  /**
   * @param {WebGL2RenderingContext} context
   * @param {ReadonlyMap<string,Attribute>} attributes
   * @param {UBOs} ubos
   * @param {ReadonlyMap<string,string>} includes
   * @param {WebGLRenderPipelineDescriptor} descriptor
   */
  constructor(context, ubos, attributes, includes, {
    vertex,
    fragment,
    topology,
    vertexLayout,
    depthTest = true,
    depthWrite = true,
    cullFace = CullFace.Back,
    frontFace = FrontFaceDirection.CCW
  }) {
    const programInfo = createProgramFromSrc(
      context,
      vertex.compile(includes),
      fragment.source.compile(includes),
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
    this.targets = fragment.targets || []

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
 * @typedef WebGLRenderPipelineDescriptor
 * @property {Shader} vertex
 * @property {{ source: Shader, targets:RenderTargetDescriptor[]}} [fragment]
 * @property {VertexLayout} vertexLayout
 * @property {PrimitiveTopology} topology
 * @property {CullFace} [cullFace]
 * @property {boolean} [depthWrite]
 * @property {boolean} [depthTest]
 * @property {FrontFaceDirection} [frontFace]
 */

/**
 * @typedef RenderTargetDescriptor
 * @property {TextureFormat} format
 * @property {BlendDescriptor} [blend]
 */
/**
 * @typedef BlendDescriptor
 * @property {BlendParams} color
 * @property {BlendParams} alpha
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