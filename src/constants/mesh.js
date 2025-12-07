/**
 * @enum {number}
 */
export const PrimitiveTopology = /** @type {const} */({
  Points: 0x0000,
  Lines: 0x0001,
  LineLoop: 0x0002,
  LineStrip: 0x0003,
  Triangles: 0x0004,
  TriangleStrip: 0x0005,
  TriangleFan: 0x0006
})

/**
 * @enum {number}
 */
export const VertexFormat = /**@type {const}*/({
  // 8-bit unsigned ints
  Uint8: 0,
  Uint8x2: 1,
  Uint8x3: 2,
  Uint8x4: 3,

  Unorm8: 4,
  Unorm8x2: 5,
  Unorm8x3: 6,
  Unorm8x4: 7,

  // 8-bit signed ints
  Sint8: 12,
  Sint8x2: 13,
  Sint8x3: 14,
  Sint8x4: 15,

  Snorm8: 8,
  Snorm8x2: 9,
  Snorm8x3: 10,
  Snorm8x4: 11,

  // 16-bit Unsigned int
  Uint16: 16,
  Uint16x2: 17,
  Uint16x3: 18,
  Uint16x4: 19,

  Unorm16: 20,
  Unorm16x2: 21,
  Unorm16x3: 22,
  Unorm16x4: 23,

  // 16-bit signed int
  Sint16: 28,
  Sint16x2: 29,
  Sint16x3: 30,
  Sint16x4: 31,

  Snorm16: 24,
  Snorm16x2: 25,
  Snorm16x3: 26,
  Snorm16x4: 27,

  // 32-bit unsigned int
  Uint32: 32,
  Uint32x2: 33,
  Uint32x3: 34,
  Uint32x4: 35,

  // 32-bit signed ints
  Sint32: 36,
  Sint32x2: 37,
  Sint32x3: 38,
  Sint32x4: 39,

  // 32-bit floating point
  Float32: 40,
  Float32x2: 41,
  Float32x3: 42,
  Float32x4: 43,
})

/**
 * @param {VertexFormat} vertexFormat
 */
export function getVertexFormatComponentNumber(vertexFormat) {
  switch (vertexFormat) {
    case VertexFormat.Uint8:
    case VertexFormat.Unorm8:
    case VertexFormat.Snorm8:
    case VertexFormat.Sint8:
    case VertexFormat.Uint16:
    case VertexFormat.Unorm16:
    case VertexFormat.Snorm16:
    case VertexFormat.Sint16:
    case VertexFormat.Uint32:
    case VertexFormat.Sint32:
    case VertexFormat.Float32:
      return 1;

    case VertexFormat.Uint8x2:
    case VertexFormat.Unorm8x2:
    case VertexFormat.Snorm8x2:
    case VertexFormat.Sint8x2:
    case VertexFormat.Uint16x2:
    case VertexFormat.Unorm16x2:
    case VertexFormat.Snorm16x2:
    case VertexFormat.Sint16x2:
    case VertexFormat.Uint32x2:
    case VertexFormat.Sint32x2:
    case VertexFormat.Float32x2:
      return 2;

    case VertexFormat.Uint8x3:
    case VertexFormat.Unorm8x3:
    case VertexFormat.Snorm8x3:
    case VertexFormat.Sint8x3:
    case VertexFormat.Uint16x3:
    case VertexFormat.Unorm16x3:
    case VertexFormat.Snorm16x3:
    case VertexFormat.Sint16x3:
    case VertexFormat.Uint32x3:
    case VertexFormat.Sint32x3:
    case VertexFormat.Float32x3:
      return 3;

    case VertexFormat.Uint8x4:
    case VertexFormat.Unorm8x4:
    case VertexFormat.Snorm8x4:
    case VertexFormat.Sint8x4:
    case VertexFormat.Uint16x4:
    case VertexFormat.Unorm16x4:
    case VertexFormat.Snorm16x4:
    case VertexFormat.Sint16x4:
    case VertexFormat.Uint32x4:
    case VertexFormat.Sint32x4:
    case VertexFormat.Float32x4:
      return 4;
    default:
      throw new Error('Unsupported vertex format');
  }
}

/**
 * @param {VertexFormat} vertexFormat
 */
export function getVertexFormatComponentSize(vertexFormat) {
  switch (vertexFormat) {
    case VertexFormat.Uint8:
    case VertexFormat.Unorm8:
    case VertexFormat.Snorm8:
    case VertexFormat.Sint8:
    case VertexFormat.Uint8x2:
    case VertexFormat.Unorm8x2:
    case VertexFormat.Snorm8x2:
    case VertexFormat.Sint8x2:
    case VertexFormat.Uint8x3:
    case VertexFormat.Unorm8x3:
    case VertexFormat.Snorm8x3:
    case VertexFormat.Sint8x3:
    case VertexFormat.Uint8x4:
    case VertexFormat.Unorm8x4:
    case VertexFormat.Snorm8x4:
    case VertexFormat.Sint8x4:
      return 1;
    case VertexFormat.Uint16:
    case VertexFormat.Unorm16:
    case VertexFormat.Snorm16:
    case VertexFormat.Sint16:
    case VertexFormat.Uint16x2:
    case VertexFormat.Unorm16x2:
    case VertexFormat.Snorm16x2:
    case VertexFormat.Sint16x2:
    case VertexFormat.Uint16x3:
    case VertexFormat.Unorm16x3:
    case VertexFormat.Snorm16x3:
    case VertexFormat.Sint16x3:
    case VertexFormat.Uint16x4:
    case VertexFormat.Unorm16x4:
    case VertexFormat.Snorm16x4:
    case VertexFormat.Sint16x4:
      return 2;
    case VertexFormat.Uint32:
    case VertexFormat.Uint32x2:
    case VertexFormat.Uint32x3:
    case VertexFormat.Uint32x4:
    case VertexFormat.Sint32:
    case VertexFormat.Sint32x2:
    case VertexFormat.Sint32x3:
    case VertexFormat.Sint32x4:
    case VertexFormat.Float32:
    case VertexFormat.Float32x2:
    case VertexFormat.Float32x3:
    case VertexFormat.Float32x4:
      return 4;
    default:
      throw new Error('Unsupported vertex format');
  }
}