export const UNI_PROJ_MAT = "projection"
export const UNI_CAM_MAT = "view"
export const UNI_MODEL_MAT = "model"

/**
 * @readonly
 * @enum {number}
 * Uniform types (scalars, vectors, matrices, and samplers).
 */
export const UniformType = {
  // Scalars
  Float: 0x1406,
  Int: 0x1404,
  Uint: 0x1405,
  Bool: 0x8B56,

  // Float vectors
  Vec2: 0x8B50,
  Vec3: 0x8B51,
  Vec4: 0x8B52,

  // Int vectors
  IVec2: 0x8B53,
  IVec3: 0x8B54,
  IVec4: 0x8B55,

  // Unsigned int vectors
  UVec2: 0x8DC6,
  UVec3: 0x8DC7,
  UVec4: 0x8DC8,

  // Bool vectors
  BVec2: 0x8B57,
  BVec3: 0x8B58,
  BVec4: 0x8B59,

  // Matrices
  Mat2: 0x8B5A,
  Mat3: 0x8B5B,
  Mat4: 0x8B5C,
  Mat2x3: 0x8B65,
  Mat2x4: 0x8B66,
  Mat3x2: 0x8B67,
  Mat3x4: 0x8B68,
  Mat4x2: 0x8B69,
  Mat4x3: 0x8B6A,

  // Samplers
  Sampler2D: 0x8B5E,
  Sampler3D: 0x8B5F,
  SamplerCube: 0x8B60,
  Sampler2DShadow: 0x8B62,
  Sampler2DArray: 0x8DC1,
  Sampler2DArrayShadow: 0x8DC4,
  SamplerCubeShadow: 0x8DC5,

  // Integer samplers
  ISampler2D: 0x8DCA,
  ISampler3D: 0x8DCB,
  ISamplerCube: 0x8DCC,
  ISampler2DArray: 0x8DCF,

  // Unsigned integer samplers
  USampler2D: 0x8DD2,
  USampler3D: 0x8DD3,
  USamplerCube: 0x8DD4,
  USampler2DArray: 0x8DD7
}

/**
 * @readonly
 * @enum {number}
 */
export const GlDataType = {
  Float: 0x1406,
  UnsignedInt: 0x1405,
  Int: 0x1404,
  UnsignedShort: 0x1403,
  Short: 0x1402,
  UnsignedByte: 0x1401,
  Byte: 0x1400
}

/**
 * @readonly
 * @enum {number}
 */
export const PrimitiveTopology = {
  Points: 0x0000,
  Lines: 0x0001,
  LineLoop: 0x0002,
  LineStrip: 0x0003,
  Triangles: 0x0004,
  TriangleStrip: 0x0005,
  TriangleFan: 0x0006
}

/**
 * @readonly
 * @enum {number}
 */
export const BufferUsage = {
  Static: 0x88E4,
  Dynamic: 0x88E8,
  Stream: 0x88E0
}

/**
 * @readonly
 * @enum {number}
 * Buffer binding targets
 */
export const BufferTarget = {
  ArrayBuffer: 0x8892,              // gl.ARRAY_BUFFER
  ElementArrayBuffer: 0x8893,       // gl.ELEMENT_ARRAY_BUFFER
  CopyReadBuffer: 0x8F36,           // gl.COPY_READ_BUFFER
  CopyWriteBuffer: 0x8F37,          // gl.COPY_WRITE_BUFFER
  PixelPackBuffer: 0x88EB,          // gl.PIXEL_PACK_BUFFER
  PixelUnpackBuffer: 0x88EC,        // gl.PIXEL_UNPACK_BUFFER
  UniformBuffer: 0x8A11,            // gl.UNIFORM_BUFFER
  TransformFeedbackBuffer: 0x8C8E   // gl.TRANSFORM_FEEDBACK_BUFFER
}

/**
 * @readonly
 * @enum {number}
 * Face culling modes
 */
export const CullFace = {
  None: 0x0000,          // Represents no culling
  Front: 0x0404,         // gl.FRONT
  Back: 0x0405,          // gl.BACK
  FrontAndBack: 0x0408   // gl.FRONT_AND_BACK
}


/**
 * @readonly
 * @enum {number}
 * Blend function factors
 */
export const BlendMode = {
  Zero: 0x0000,                    // gl.ZERO
  One: 0x0001,                     // gl.ONE
  SrcColor: 0x0300,                // gl.SRC_COLOR
  OneMinusSrcColor: 0x0301,        // gl.ONE_MINUS_SRC_COLOR
  SrcAlpha: 0x0302,                // gl.SRC_ALPHA
  OneMinusSrcAlpha: 0x0303,        // gl.ONE_MINUS_SRC_ALPHA
  DstAlpha: 0x0304,                // gl.DST_ALPHA
  OneMinusDstAlpha: 0x0305,        // gl.ONE_MINUS_DST_ALPHA
  DstColor: 0x0306,                // gl.DST_COLOR
  OneMinusDstColor: 0x0307,        // gl.ONE_MINUS_DST_COLOR
  SrcAlphaSaturate: 0x0308,        // gl.SRC_ALPHA_SATURATE
  ConstantColor: 0x8001,           // gl.CONSTANT_COLOR
  OneMinusConstantColor: 0x8002,   // gl.ONE_MINUS_CONSTANT_COLOR
  ConstantAlpha: 0x8003,           // gl.CONSTANT_ALPHA
  OneMinusConstantAlpha: 0x8004    // gl.ONE_MINUS_CONSTANT_ALPHA
}

/**
 * @readonly
 * @enum {number}
 * Blend equation modes
 */
export const BlendEquation = {
  Add: 0x8006,             // gl.FUNC_ADD
  Subtract: 0x800A,        // gl.FUNC_SUBTRACT
  ReverseSubtract: 0x800B, // gl.FUNC_REVERSE_SUBTRACT
  Min: 0x8007,             // gl.MIN
  Max: 0x8008              // gl.MAX
}

/**
 * @enum {number}
 */
export const TextureFormat = {
  // --- 8-bit ---
  R8Unorm: 1,
  R8Snorm: 2,
  R8Uint: 3,
  R8Sint: 4,

  // --- 16-bit ---
  R16Uint: 5,
  R16Sint: 6,
  R16Float: 7,
  RG8Unorm: 8,
  RG8Snorm: 9,
  RG8Uint: 10,
  RG8Sint: 11,

  // --- 32-bit ---
  R32Uint: 12,
  R32Sint: 13,
  R32Float: 14,
  RG16Uint: 15,
  RG16Sint: 16,
  RG16Float: 17,
  RGBA8Unorm: 18,
  RGBA8UnormSRGB: 19,
  RGBA8Snorm: 20,
  RGBA8Uint: 21,
  RGBA8Sint: 22,

  // --- 64-bit ---
  RG32Uint: 23,
  RG32Sint: 24,
  RG32Float: 25,
  RGBA16Uint: 26,
  RGBA16Sint: 27,
  RGBA16Float: 28,

  // --- 128-bit ---
  RGBA32Uint: 29,
  RGBA32Sint: 30,
  RGBA32Float: 31,

  // --- Depth / Stencil ---
  Stencil8: 32,
  Depth16Unorm: 33,
  Depth24Plus: 34,
  Depth24PlusStencil8: 35,
  Depth32Float: 36,
  Depth32FloatStencil8: 37,
}

/**
 * @readonly
 * @enum {number}
 */
export const TextureFilter = {
  Nearest: 0x2600,
  Linear: 0x2601
}

/**
 * @readonly
 * @enum {number}
 */
export const TextureWrap = {
  Repeat: 0x2901,
  Clamp: 0x812F,
  MirrorRepeat: 0x8370
}

/**
 * @readonly
 * @enum {number}
 * Texture binding targets
 */
export const TextureType = {
  Texture2D: 0x0DE1,         // gl.TEXTURE_2D
  Texture2DArray: 0x8C1A,    // gl.TEXTURE_2D_ARRAY
  Texture3D: 0x806F,         // gl.TEXTURE_3D
  TextureCubeMap: 0x8513     // gl.TEXTURE_CUBE_MAP
}

/**
 * @readonly
 * @enum {number}
 * Comparison functions for depth, stencil, and sampler tests
 */
export const CompareFunction = {
  Never: 0x0200,      // gl.NEVER
  Less: 0x0201,       // gl.LESS
  Equal: 0x0202,      // gl.EQUAL
  Lequal: 0x0203,     // gl.LEQUAL
  Greater: 0x0204,    // gl.GREATER
  NotEqual: 0x0205,   // gl.NOTEQUAL
  Gequal: 0x0206,     // gl.GEQUAL
  Always: 0x0207      // gl.ALWAYS
}


/**
 * @readonly
 * @enum {number}
 * Texture comparison modes for depth samplers
 */
export const TextureCompareMode = {
  None: 0x0000,                  // gl.NONE — comparison disabled
  CompareRefToTexture: 0x884E    // gl.COMPARE_REF_TO_TEXTURE — depth comparison enabled
}

/**
 * @readonly
 * @enum {number}
 * Stencil and depth buffer operations.
 */
export const StencilOp = {
  Keep: 0x1E00,        // gl.KEEP
  Zero: 0x0000,        // gl.ZERO
  Replace: 0x1E01,     // gl.REPLACE
  Incr: 0x1E02,        // gl.INCR
  IncrWrap: 0x8507,    // gl.INCR_WRAP
  Decr: 0x1E03,        // gl.DECR
  DecrWrap: 0x8508,    // gl.DECR_WRAP
  Invert: 0x150A       // gl.INVERT
}

/**
 * @readonly
 * @enum {number}
 * Polygon winding directions for front-face determination.
 */
export const FrontFaceDirection = {
  CW: 0x0900,   // gl.CW
  CCW: 0x0901   // gl.CCW
}

/**
 * @readonly
 * @enum {number}
 * Primitive output modes for transform feedback
 */
export const TransformFeedbackPrimitiveTopology = {
  Points: 0x0000,      // gl.POINTS
  Lines: 0x0001,       // gl.LINES
  Triangles: 0x0004    // gl.TRIANGLES
}

/**
 * @readonly
 * @enum {number}
 * Buffer storage modes for transform feedback varyings
 */
export const TransformFeedbackBufferMode = {
  Interleaved: 0x8C8C,  // gl.INTERLEAVED_ATTRIBS
  Separate: 0x8C8D      // gl.SEPARATE_ATTRIBS
}

/**
 * @readonly
 * @enum {number}
 * Internal formats for renderbuffers
 */
export const RenderbufferFormat = {
  Rgba4: 0x8056,            // gl.RGBA4
  Rgb565: 0x8D62,           // gl.RGB565
  Rgb5A1: 0x8057,           // gl.RGB5_A1
  Depth16: 0x81A5,          // gl.DEPTH_COMPONENT16
  Stencil8: 0x8D48,         // gl.STENCIL_INDEX8
  Depth24: 0x81A6,          // gl.DEPTH_COMPONENT24
  Depth32f: 0x8CAC,         // gl.DEPTH_COMPONENT32F
  Depth24Stencil8: 0x88F0,  // gl.DEPTH24_STENCIL8
  Depth32fStencil8: 0x8CAD  // gl.DEPTH32F_STENCIL8
}