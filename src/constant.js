export const UNI_PROJ_MAT = "projection"
export const UNI_CAM_MAT = "view"
export const UNI_MODEL_MAT = "model"

/**
 * @readonly
 * @enum {number}
 */
export const UniformType = {
  // Scalars
  FLOAT: 0x1406,
  INT: 0x1404,
  UINT: 0x1405, // WebGL2
  BOOL: 0x8B56,

  // Float vectors
  VEC2: 0x8B50,
  VEC3: 0x8B51,
  VEC4: 0x8B52,

  // Int vectors
  IVEC2: 0x8B53,
  IVEC3: 0x8B54,
  IVEC4: 0x8B55,

  // Unsigned int vectors (WebGL2)
  UVEC2: 0x8DC6,
  UVEC3: 0x8DC7,
  UVEC4: 0x8DC8,

  // Bool vectors
  BVEC2: 0x8B57,
  BVEC3: 0x8B58,
  BVEC4: 0x8B59,

  // Matrices
  MAT2: 0x8B5A,
  MAT3: 0x8B5B,
  MAT4: 0x8B5C,
  MAT2x3: 0x8B65, // WebGL2
  MAT2x4: 0x8B66, // WebGL2
  MAT3x2: 0x8B67, // WebGL2
  MAT3x4: 0x8B68, // WebGL2
  MAT4x2: 0x8B69, // WebGL2
  MAT4x3: 0x8B6A, // WebGL2

  // Sampler
  SAMPLER:0x82E6,// WEBGL 2

  // Textures
  SAMPLER_2D: 0x8B5E,
  SAMPLER_CUBE: 0x8B60,
  SAMPLER_2D_SHADOW: 0x8B62, // WebGL2
  SAMPLER_2D_ARRAY: 0x8DC1, // WebGL2
  SAMPLER_2D_ARRAY_SHADOW: 0x8DC4, // WebGL2
  SAMPLER_CUBE_SHADOW: 0x8DC5, // WebGL2

  // Int textures (WebGL2)
  ISAMPLER_2D: 0x8DCA,
  ISAMPLER_3D: 0x8DCB,
  ISAMPLER_CUBE: 0x8DCC,
  ISAMPLER_2D_ARRAY: 0x8DCF,

  // Unsigned int textures (WebGL2)
  USAMPLER_2D: 0x8DD2,
  USAMPLER_3D: 0x8DD3,
  USAMPLER_CUBE: 0x8DD4,
  USAMPLER_2D_ARRAY: 0x8DD7,
};

/**
 * @readonly
 * @enum {number}
 */
export const GlDataType = {
  FLOAT: 0x1406,
  UNSIGNED_INT: 0x1405,
  INT: 0x1404,
  UNSIGNED_SHORT: 0x1403,
  SHORT: 0x1402,
  UNSIGNED_BYTE: 0x1401,
  BYTE: 0x1400
}
/**
 * @readonly
 * @enum {number}
 */
export const DrawMode = {
  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006
}
/**
 * @readonly
 * @enum {number}
 */
export const DrawUsage = {
  STATIC: 0x88E4,
  DYNAMIC: 0x88E8,
  STREAM: 0x88E0
}
/**
 * @readonly
 * @enum {number}
 */
export const CullFace = {
  FRONT: 0x0404,
  BACK: 0x0405,
  BOTH: 0x0408,
  NONE: 0
}
/**
 * @readonly
 * @enum {number}
 */
export const BlendMode = {
  ZERO: 0x0000,
  ONE: 0x00001,
  SRC_COLOR: 0x0300,
  ONE_MINUS_SRC_COLOR: 0x0301,
  SRC_ALPHA: 0x0302,
  ONE_MINUS_SRC_ALPHA: 0x0303,
  DST_ALPHA: 0x0304,
  ONE_MINUS_DIST_ALPHA: 0x0305,
  DST_COLOR: 0x0306,
  ONE_MINUS_DST_COLOR: 0x0307,
  SRC_ALPHA_SATURATE: 0x0308,
  CONSTANT_COLOR: 0x8001,
  ONE_MINUS_CONSTANT_COLOR: 0x8002,
  CONSTANT_ALPHA: 0x8003,
  ONE_MINUS_CONSTANT_ALPHA: 0x8004
}

export const BlendEquations = {
  ADD: 0x8006,
  SUBTRACT: 0x800A,
  REVERSE_SUBTRACT: 0x800B
}
/**
 * @readonly
 * @enum {number}
 */
export const TextureFormat = {
  R8: 0x8229,
  R8_SNORM: 0x8F94,
  RG8: 0x822B,
  RG8_SNORM: 0x8F95,
  RGB8: 0x8051,
  RGB8_SNORM: 0x8F96,
  RGB565: 0x8D62,
  RGBA4: 0x8056,
  RGB5_A1: 0x8057,
  RGBA8: 0x8058,
  RGBA8_SNORM: 0x8F97,
  RGB10_A2: 0x8059,
  RGB10_A2UI: 0x906F,
  SRGB8: 0x8C41,
  SRGB8_ALPHA8: 0x8C43,
  R16F: 0x822D,
  RG16F: 0x822F,
  RGB16F: 0x881B,
  RGBA16F: 0x881A,
  R32F: 0x822E,
  RG32F: 0x8230,
  RGB32F: 0x8815,
  RGBA32F: 0x8814,
  R11F_G11F_B10F: 0x8C3A,
  RGB9_E5: 0x8C3D,

  // Integer formats
  R8I: 0x8231,
  R8UI: 0x8232,
  R16I: 0x8233,
  R16UI: 0x8234,
  R32I: 0x8235,
  R32UI: 0x8236,
  RG8I: 0x8237,
  RG8UI: 0x8238,
  RG16I: 0x8239,
  RG16UI: 0x823A,
  RG32I: 0x823B,
  RG32UI: 0x823C,
  RGB8I: 0x8D8F,
  RGB8UI: 0x8D7D,
  RGB16I: 0x8D89,
  RGB16UI: 0x8D77,
  RGB32I: 0x8D83,
  RGB32UI: 0x8D71,
  RGBA8I: 0x8D8E,
  RGBA8UI: 0x8D7C,
  RGBA16I: 0x8D88,
  RGBA16UI: 0x8D76,
  RGBA32I: 0x8D82,
  RGBA32UI: 0x8D70,

  // Depth / stencil formats
  DEPTH16: 0x81A5,
  DEPTH24: 0x81A6,
  DEPTH32F: 0x8CAC,
  DEPTH24_STENCIL8: 0x88F0,
  DEPTH32F_STENCIL8: 0x8CAD,
  STENCIL_INDEX8: 0x8D48,
};

/**
 * @readonly
 * @enum {number}
 */
export const TextureFormatUsage = {
  // Base color formats
  RED: 0x1903,
  RG: 0x8227,
  RGB: 0x1907,
  RGBA: 0x1908,

  // Integer formats
  RED_INTEGER: 0x8D94,
  RG_INTEGER: 0x8228,
  RGB_INTEGER: 0x8D98,
  RGBA_INTEGER: 0x8D99,

  // Depth / stencil formats
  DEPTH_COMPONENT: 0x1902,
  DEPTH_STENCIL: 0x84F9,
};


/**
 * @readonly
 * @enum {number}
 */
export const TextureFilter = {
  NEAREST: 0x2600,
  LINEAR: 0x2601
}
/**
 * @readonly
 * @enum {number}
 */
export const TextureWrap = {
  REPEAT: 0x2901,
  CLAMP: 0x812F,
  MIRRORREPEAT: 0x8370
}

/**
 * @readonly
 * @enum {number}
 */
export const TextureType = {
  TEXTURE_2D: 0x0DE1,
  TEXTURE_2D_ARRAY: 0x8C1A,
  TEXTURE_3D: 0x806F,
  TEXTURE_CUBE_MAP: 0x8513,
};


/**
 * @readonly
 * @enum {number}
 */
export const CompareFunction = {
  LEQUAL: 0x203,
  GEQUAL: 0x206,
  LESS: 0x201,
  GREATER: 0x204,
  EQUAL: 0x202,
  NOTEQUAL: 0x205,
  ALWAYS: 0x207,
  NEVER: 0x200
}

/**
 * @readonly
 * @enum {number}
 */
export const TextureCompareMode = {
  NONE: 0x0,
  COMPARE_REF_TO_TEXTURE: 0x884E
}