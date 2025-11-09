import { TextureFormat } from "./constants.js";

/**
 * Returns the size in bytes per texel for a given TextureFormat.
 * @param {TextureFormat} format
 * @returns {number}
 */
export function getTextureFormatSize(format) {
  switch (format) {
    // 8-bit = 1 byte
    case TextureFormat.R8Unorm:
    case TextureFormat.R8Snorm:
    case TextureFormat.R8Uint:
    case TextureFormat.R8Sint:
      return 1;

    // 16-bit = 2 bytes
    case TextureFormat.R16Uint:
    case TextureFormat.R16Sint:
    case TextureFormat.R16Float:
    case TextureFormat.RG8Unorm:
    case TextureFormat.RG8Snorm:
    case TextureFormat.RG8Uint:
    case TextureFormat.RG8Sint:
      return 2;

    // 32-bit = 4 bytes
    case TextureFormat.R32Uint:
    case TextureFormat.R32Sint:
    case TextureFormat.R32Float:
    case TextureFormat.RG16Uint:
    case TextureFormat.RG16Sint:
    case TextureFormat.RG16Float:
    case TextureFormat.RGBA8Unorm:
    case TextureFormat.RGBA8UnormSRGB:
    case TextureFormat.RGBA8Snorm:
    case TextureFormat.RGBA8Uint:
    case TextureFormat.RGBA8Sint:
      return 4;

    // 64-bit = 8 bytes
    case TextureFormat.RG32Uint:
    case TextureFormat.RG32Sint:
    case TextureFormat.RG32Float:
    case TextureFormat.RGBA16Uint:
    case TextureFormat.RGBA16Sint:
    case TextureFormat.RGBA16Float:
      return 8;

    // 128-bit = 16 bytes
    case TextureFormat.RGBA32Uint:
    case TextureFormat.RGBA32Sint:
    case TextureFormat.RGBA32Float:
      return 16;

    // Depth/stencil formats — size varies and is implementation-specific
    case TextureFormat.Stencil8:
      return 1;
    case TextureFormat.Depth16Unorm:
      return 2;
    case TextureFormat.Depth24Plus:
    case TextureFormat.Depth24PlusStencil8:
      return 4; // Typically 3 or 4 bytes — assume 4
    case TextureFormat.Depth32Float:
      return 4;
    case TextureFormat.Depth32FloatStencil8:
      return 5; // 4 (depth) + 1 (stencil) — approximate

    default:
      throw new Error(`Unknown or unsupported texture format: ${format}`);
  }
}