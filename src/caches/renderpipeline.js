import { assert } from "../utils/index.js";
import { BlendEquation, BlendMode, CullFace, FrontFaceDirection, PrimitiveTopology,TextureFormat, UniformType } from "../constants/index.js";
import { MeshVertexLayout, UniformBufferLayout } from "../core/layouts/index.js";
import { Shader } from "../core/shader.js";
import { Uniform } from "../core/layouts/uniform.js";

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

  clone() {
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
   * @param {WebGLRenderPipelineDescriptor} descriptor
   */
  constructor(context, {
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
      vertex.compile(),
      fragment?.source?.compile() || '',
      vertexLayout
    )

    assert(programInfo, 'Cannot create webgl render pipeline')

    this.program = programInfo.program
    this.uniforms = programInfo.uniforms
    this.uniformBlocks = programInfo.uniformBlocks
    this.vertexLayout = vertexLayout
    this.topology = topology
    this.cullMode = cullFace
    this.depthTest = depthTest
    this.depthWrite = depthWrite
    this.frontFace = frontFace
    this.targets = fragment?.targets || []
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
 * @property {MeshVertexLayout} vertexLayout
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

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} vshader
 * @param {string} fshader
 * @param {MeshVertexLayout} vertexLayout
 */
function createProgramFromSrc(gl, vshader, fshader, vertexLayout) {
  let v = createshader(gl, vshader, gl.VERTEX_SHADER)
  let f = createshader(gl, fshader, gl.FRAGMENT_SHADER)
  if (f == null || v == null) {
    gl.deleteShader(v)
    gl.deleteShader(f)
    return null
  }
  let program = createProgram(gl, v, f, vertexLayout)

  return program
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLShader} vshader 
 * @param {WebGLShader} fshader
 * @param {MeshVertexLayout} vertexLayout
 * 
 */
function createProgram(gl, vshader, fshader, vertexLayout) {
  let program = gl.createProgram()
  gl.attachShader(program, vshader)
  gl.attachShader(program, fshader)

  for (const layout of vertexLayout.layouts) {
    for (const attribute of layout.attributes) {
      gl.bindAttribLocation(program, attribute.id, attribute.name)
    }
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Program could not be linked: 
    ========================================
    ${gl.getProgramInfoLog(program)}
    `);
    gl.deleteProgram(program)
    return null
  }
  gl.validateProgram(program)
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.log(`Program could not be validated: 
    ========================================
    ${gl.getProgramInfoLog(program)}
    `);
    gl.deleteProgram(program)
    return null
  }

  gl.useProgram(program)
  gl.detachShader(program, vshader)
  gl.detachShader(program, fshader)
  gl.deleteShader(vshader)
  gl.deleteShader(fshader)
  return {
    program,
    uniforms: getActiveUniforms(gl, program),
    uniformBlocks: getActiveUniformBlocks(gl, program)
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @returns {Map<string,Uniform>}
 */
function getActiveUniforms(gl, program) {
  let texture2d = 0, cubemap = 0, texture2dArray = 0, texture3d = 0
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const map = new Map()
  for (let i = 0; i < numUniforms; i++) {
    const info = gl.getActiveUniform(program, i)

    if (!info) continue

    const location = gl.getUniformLocation(program, info.name)
    const [blockIndex] = gl.getActiveUniforms(
      program,
      [i],
      gl.UNIFORM_BLOCK_INDEX
    )
    if (blockIndex !== -1 || !location) continue
    const uniform = new Uniform(
      location,
      info.type,
      info.size
    )

    switch (info.type) {
      case UniformType.Sampler2D:
      case UniformType.ISampler2D:
      case UniformType.USampler2D:
      case UniformType.Sampler2DShadow:
        uniform.texture_unit = texture2d
        texture2d += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.Sampler2DArray:
      case UniformType.ISampler2DArray:
      case UniformType.USampler2DArray:
      case UniformType.Sampler2DArrayShadow:
        uniform.texture_unit = texture2dArray
        texture2dArray += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.SamplerCube:
      case UniformType.ISamplerCube:
      case UniformType.USamplerCube:
      case UniformType.SamplerCubeShadow:
        uniform.texture_unit = cubemap
        cubemap += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
      case UniformType.Sampler3D:
      case UniformType.ISampler3D:
      case UniformType.USampler3D:
        uniform.texture_unit = texture3d
        texture3d += 1
        gl.uniform1i(location, uniform.texture_unit)
        break
    }
    map.set(info.name, uniform)
  }
  return map
}

/**
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLProgram} program 
 * @returns {Map<string,UniformBufferLayout>}
 */
function getActiveUniformBlocks(gl, program) {
  const results = new Map()
  const numBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);

  for (let i = 0; i < numBlocks; i++) {
    const name = gl.getActiveUniformBlockName(program, i);
    results.set(name, getUniformBufferLayout(gl, program, i))
  }
  return results
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {number} index
 */
function getUniformBufferLayout(gl, program, index) {
  const size = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_DATA_SIZE
  )
  const uniformIndices = gl.getActiveUniformBlockParameter(
    program,
    index,
    gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES
  )
  const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
  const strides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
  const fields = new Map()

  uniformIndices.forEach((/** @type {number} */ index, /** @type {string | number} */ i) => {
    const info = gl.getActiveUniform(program, index)

    if (!info) {
      return
    }
    return fields.set(info.name, {
      type: info.type,
      size: info.size,
      offset: offsets[i],
      stride: strides[i]
    })
  });
  return new UniformBufferLayout("", size, fields)
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} src
 * @param {number} type
 */
function createshader(gl, src, type) {
  let shader = gl.createShader(type)

  assert(shader, "No shader created")

  gl.shaderSource(shader, src)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Shader could not compile: 
    ${formatGlsl(src)}
    ========================================
    ${gl.getShaderInfoLog(shader)}
    `);
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * @param {string} code
 */
function formatGlsl(code) {
  const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n")

  return lines.map((ln, idx) => {
    const num = (idx + 1).toString()
    return `${num}: ${ln}`;
  })
    .join("\n");
}