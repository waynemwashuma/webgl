/**
 * Queries and stores WebGL 2.0 GPU capability limits in organized groups.
 */
export class WebGLDeviceLimits {
  /**
   * @type {WebGLTextureLimits}
   */
  textures

  /**
   * @type {WebGLBufferLimits}
   */
  buffers

  /**
   * @type {WebGLAttributeLimits}
   */
  attributes

  /**
   * @type {WebGLUniformLimits}
   */
  uniforms

  /**
   * @type {WebGLFramebufferLimits}
   */
  framebuffer

  /**
   * @type {WebGLTransformFeedbackLimits}
   */
  transformFeedback

  /**
   * @type {WebGLShaderPrecisionLimits}
   */
  precision

  /**
   * @type {WebGLExtensionLimits}
   */
  extensions

  /**
   * @type {WebGLDeviceInfo}
   */
  info

  /**
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    // === Texture limits ===
    this.textures = queryTextureLimits(gl)

    // === Buffer and memory-related limits ===
    this.buffers = {
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxUniformBufferBindings: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS),
      maxUniformBlockSize: gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE),
    }

    // === Attribute / Vertex Shader limits ===
    this.attributes = {
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxVertexOutputComponents: gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS),
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
    }

    // === Uniform / Shader limits ===
    this.uniforms = {
      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      maxVertexUniformBlocks: gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS),
      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      maxFragmentUniformBlocks: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS),
      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      maxFragmentInputComponents: gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS),
    }

    // === Framebuffer / Render Target limits ===
    this.framebuffer = {
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      maxDrawBuffers: gl.getParameter(gl.MAX_DRAW_BUFFERS),
      maxColorAttachments: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
      maxSamples: gl.getParameter(gl.MAX_SAMPLES),
    }

    // === Transform Feedback limits ===
    this.transformFeedback = {
      maxInterleavedComponents: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS),
      maxSeparateAttribs: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS),
      maxSeparateComponents: gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS),
    }

    // === Precision limits ===
    this.precision = {
      vertex: {
        highFloat: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT),
        mediumFloat: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT),
        lowFloat: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_FLOAT),
        highInt: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_INT),
        mediumInt: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_INT),
        lowInt: gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.LOW_INT),
      },
      fragment: {
        highFloat: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT),
        mediumFloat: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT),
        lowFloat: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_FLOAT),
        highInt: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT),
        mediumInt: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_INT),
        lowInt: gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.LOW_INT),
      },
    }

    // === Extensions and optional limits ===
    const extAniso =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")

    this.extensions = {
      anisotropy: extAniso
        ? gl.getParameter(extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        : 1,
    }

    // === Debug info (vendor/renderer) ===
    const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info")
    this.info = {
      vendor: dbgInfo
        ? gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR),
      renderer: dbgInfo
        ? gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
    }
  }
}

/**
 * @typedef WebGLTextureLimits
 * @property {number} maxTextureSize
 * @property {number} maxCubeMapTextureSize
 * @property {number} max3DTextureSize
 * @property {number} maxArrayTextureLayers
 * @property {number} maxCombinedTextureImageUnits
 * @property {number} maxVertexTextureImageUnits
 * @property {number} maxFragmentTextureImageUnits
 * @property {number} maxTextureAnisotropy
 */

/**
 * @typedef WebGLAttributeLimits
 * @property {number} maxVertexAttribs
 * @property {number} maxVertexOutputComponents
 * @property {Float32Array} aliasedPointSizeRange
 * @property {Float32Array} aliasedLineWidthRange
 */

/**
 * @typedef WebGLUniformLimits
 * @property {number} maxVertexUniformVectors
 * @property {number} maxVertexUniformBlocks
 * @property {number} maxFragmentUniformVectors
 * @property {number} maxFragmentUniformBlocks
 * @property {number} maxVaryingVectors
 * @property {number} maxFragmentInputComponents
 */

/**
 * @typedef WebGLBufferLimits
 * @property {number} maxRenderbufferSize
 * @property {number} maxUniformBufferBindings
 * @property {number} maxUniformBlockSize
 */

/**
 * @typedef WebGLFramebufferLimits
 * @property {Int32Array} maxViewportDims
 * @property {number} maxDrawBuffers
 * @property {number} maxColorAttachments
 * @property {number} maxSamples
 */

/**
 * @typedef WebGLTransformFeedbackLimits
 * @property {number} maxInterleavedComponents
 * @property {number} maxSeparateAttribs
 * @property {number} maxSeparateComponents
 */

/**
 * @typedef WebGLDeviceInfo
 * @property {string} vendor
 * @property {string} renderer
 */

/**
 * @typedef WebGLShaderPrecisionLimits
 * @property {WebGLShaderPrecisionInfo} vertex
 * @property {WebGLShaderPrecisionInfo} fragment
 */

/**
 * @typedef WebGLShaderPrecisionInfo
 * @property {WebGLShaderPrecisionFormat} highFloat
 * @property {WebGLShaderPrecisionFormat} mediumFloat
 * @property {WebGLShaderPrecisionFormat} lowFloat
 * @property {WebGLShaderPrecisionFormat} highInt
 * @property {WebGLShaderPrecisionFormat} mediumInt
 * @property {WebGLShaderPrecisionFormat} lowInt
 */

/**
 * @typedef WebGLExtensionLimits
 * @property {number} anisotropy
 */

/**
 * Query all texture-related limits and supported features.
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLTextureLimits}
 */
function queryTextureLimits(gl) {
  const extAniso =
    gl.getExtension("EXT_texture_filter_anisotropic") ||
    gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
    gl.getExtension("MOZ_EXT_texture_filter_anisotropic")

  return {
    // === Core WebGL2 texture limits ===
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
    max3DTextureSize: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE),
    maxArrayTextureLayers: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
    maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    maxFragmentTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),

    // === Extension-based limits ===
    maxTextureAnisotropy: extAniso
      ? gl.getParameter(extAniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
      : 1
  }
}
