/**
 * @enum {number}
 */
export const TextureFormat = /** @type {const} */({
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
})

/**
 * @enum {number}
 */
export const TextureFilter = /** @type {const} */({
  Nearest: 0x2600,
  Linear: 0x2601
})

/**
 * @enum {number}
 */
export const TextureWrap = /** @type {const} */({
  Repeat: 0x2901,
  Clamp: 0x812F,
  MirrorRepeat: 0x8370
})

/**
 * @enum {number}
 * Texture binding targets
 */
export const TextureType = /** @type {const} */({
  Texture2D: 0x0DE1,         // gl.TEXTURE_2D
  Texture2DArray: 0x8C1A,    // gl.TEXTURE_2D_ARRAY
  Texture3D: 0x806F,         // gl.TEXTURE_3D
  TextureCubeMap: 0x8513     // gl.TEXTURE_CUBE_MAP
})