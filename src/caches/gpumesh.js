import { VertexFormat, BufferType, BufferUsage, GlDataType } from "../constants/index.js"
import { MeshVertexLayout } from "../core/index.js"
import { createBuffer, updateBuffer } from "../function.js"
import { Mesh } from "../mesh/index.js"
import { assert } from "../utils/index.js"

export class GPUMesh {
  /**
   * @readonly
   * @type {WebGLVertexArrayObject}
   */
  object

  /**
   * @type {WebGLBuffer[]}
   */
  attributeBuffers = []

  /**
   * @type {WebGLBuffer | undefined}
   */
  indexBuffer

  /**
   * @type {GlDataType | undefined}
   */
  indexType

  /**
   * @type {number}
   */
  count

  /**
   * @type {number}
   */
  layoutHash

  /**
   * @param {WebGL2RenderingContext} context
   * @param {Mesh} mesh
   * @param {MeshVertexLayout} layout
   * @param {number} layoutHash
   */
  constructor(context, mesh, layout, layoutHash) {
    const vao = context.createVertexArray()

    this.object = vao
    this.count = 0
    this.layoutHash = layoutHash
    this.update(context, mesh, layout)
  }

  /**
   * @param {WebGL2RenderingContext} context
   * @param {Mesh} mesh
   * @param {MeshVertexLayout} layout
   */
  update(context, mesh, layout) {
    context.bindVertexArray(this.object)
    updateVAO(context, layout, mesh, this)
  }
}

/**
 * @param {WebGL2RenderingContext} context
 * @param {MeshVertexLayout} layout
 * @param {Mesh} mesh
 * @param {GPUMesh} gpuMesh
 */
export function updateVAO(context, layout, mesh, gpuMesh) {
  const { indices, attributes } = mesh
  let attrCount

  // TODO: Delete the old buffers if present, probably leaking memory here
  if (indices !== undefined) {
    const buffer = createBuffer(context, BufferType.ElementArray, indices.byteLength)

    updateBuffer(context, BufferType.ElementArray, indices, BufferUsage.Static)
    gpuMesh.indexType = mapToIndicesType(indices)
    gpuMesh.indexBuffer = buffer
  }

  for (const vertexLayout of layout.layouts) {
    const attribute = vertexLayout.attributes[0]

    assert(attribute, "The mesh vertex layout is incorrectly set up for the provided mesh.")

    const data = attributes.get(attribute.name)

    assert(data, `The provided mesh does not have the vertex attribute ${attribute.name}`)

    // This only works for separate buffers for each vertex attribute.
    const buffer = createBuffer(context, BufferType.Array, data.byteLength)
    const params = mapVertexFormatToWebGL(attribute.format)
    const count = data.byteLength / (params.size * getByteSize(params.type))

    updateBuffer(context, BufferType.Array, data)
    context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW)
    setVertexAttribute(context, attribute.id, params)
    gpuMesh.attributeBuffers.push(buffer)

    if (attrCount) {
      if (count < attrCount) {
        attrCount = count
      }
    } else {
      attrCount = count
    }
  }

  if (indices) {
    gpuMesh.count = indices.length
  } else if (attrCount !== undefined) {
    gpuMesh.count = attrCount
  } else {
    gpuMesh.count = 0
  }
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} index
 * @param {WebGLAtttributeParams} params
 * @param {number} [stride = 0]
 * @param {number} [offset = 0]
 */
function setVertexAttribute(gl, index, params, stride = 0, offset = 0) {
  const { type, size, normalized } = params
  gl.enableVertexAttribArray(index)
  switch (type) {
    case GlDataType.Float:
      gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
      break;

    case GlDataType.Byte:
    case GlDataType.UnsignedByte:
    case GlDataType.Short:
    case GlDataType.UnsignedShort:
    case GlDataType.Int:
    case GlDataType.UnsignedInt:
      if (normalized) {
        gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
      } else {
        gl.vertexAttribIPointer(index, size, type, stride, offset);
      }
      break;

    default:
      throw new Error(`Unsupported GlDataType: ${type}`);
  }
}

/**
 * @param {Uint8Array | Uint16Array | Uint32Array} indices
 */
function mapToIndicesType(indices) {
  if (indices instanceof Uint8Array) {
    return GlDataType.UnsignedByte
  }
  if (indices instanceof Uint16Array) {
    return GlDataType.UnsignedShort
  }
  if (indices instanceof Uint32Array) {
    return GlDataType.UnsignedInt
  }
  throw "This is unreachable!"
}

/**
 * @param {GlDataType} glDataType
 * @returns {number}
 */
function getByteSize(glDataType) {
  switch (glDataType) {
    case GlDataType.Float:
      return 4
    case GlDataType.UnsignedInt:
      return 4
    case GlDataType.Int:
      return 4
    case GlDataType.UnsignedShort:
      return 2
    case GlDataType.Short:
      return 2
    case GlDataType.UnsignedByte:
      return 1
    case GlDataType.Byte:
      return 1
    default:
      return 0
  }
}

/**
 * Maps a `VertexFormat` enum value to WebGL format attributes for use in vertexAttribPointer or equivalent functions.
 * @param {VertexFormat} format
 * @returns {WebGLAtttributeParams}
 */
function mapVertexFormatToWebGL(format) {
  const gl = WebGL2RenderingContext
  switch (format) {
    // 8-bit int
    case VertexFormat.Uint8:
      return { size: 1, type: gl.UNSIGNED_BYTE, normalized: false };
    case VertexFormat.Uint8x2:
      return { size: 2, type: gl.UNSIGNED_BYTE, normalized: false };
    case VertexFormat.Uint8x3:
      return { size: 3, type: gl.UNSIGNED_BYTE, normalized: false };
    case VertexFormat.Uint8x4:
      return { size: 4, type: gl.UNSIGNED_BYTE, normalized: false };

    case VertexFormat.Unorm8:
      return { size: 1, type: gl.UNSIGNED_BYTE, normalized: true };
    case VertexFormat.Unorm8x2:
      return { size: 2, type: gl.UNSIGNED_BYTE, normalized: true };
    case VertexFormat.Unorm8x3:
      return { size: 3, type: gl.UNSIGNED_BYTE, normalized: true };
    case VertexFormat.Unorm8x4:
      return { size: 4, type: gl.UNSIGNED_BYTE, normalized: true };

    case VertexFormat.Snorm8:
      return { size: 1, type: gl.BYTE, normalized: true };
    case VertexFormat.Snorm8x2:
      return { size: 2, type: gl.BYTE, normalized: true };
    case VertexFormat.Snorm8x3:
      return { size: 3, type: gl.BYTE, normalized: true };
    case VertexFormat.Snorm8x4:
      return { size: 4, type: gl.BYTE, normalized: true };

    case VertexFormat.Sint8:
      return { size: 1, type: gl.BYTE, normalized: false };
    case VertexFormat.Sint8x2:
      return { size: 2, type: gl.BYTE, normalized: false };
    case VertexFormat.Sint8x3:
      return { size: 3, type: gl.BYTE, normalized: false };
    case VertexFormat.Sint8x4:
      return { size: 4, type: gl.BYTE, normalized: false };

    // 16-bit int
    case VertexFormat.Uint16:
      return { size: 1, type: gl.UNSIGNED_SHORT, normalized: false };
    case VertexFormat.Uint16x2:
      return { size: 2, type: gl.UNSIGNED_SHORT, normalized: false };
    case VertexFormat.Uint16x3:
      return { size: 3, type: gl.UNSIGNED_SHORT, normalized: false };
    case VertexFormat.Uint16x4:
      return { size: 4, type: gl.UNSIGNED_SHORT, normalized: false };

    case VertexFormat.Unorm16:
      return { size: 1, type: gl.UNSIGNED_SHORT, normalized: true };
    case VertexFormat.Unorm16x2:
      return { size: 2, type: gl.UNSIGNED_SHORT, normalized: true };
    case VertexFormat.Unorm16x3:
      return { size: 3, type: gl.UNSIGNED_SHORT, normalized: true };
    case VertexFormat.Unorm16x4:
      return { size: 4, type: gl.UNSIGNED_SHORT, normalized: true };

    case VertexFormat.Snorm16:
      return { size: 1, type: gl.SHORT, normalized: true };
    case VertexFormat.Snorm16x2:
      return { size: 2, type: gl.SHORT, normalized: true };
    case VertexFormat.Snorm16x3:
      return { size: 3, type: gl.SHORT, normalized: true };
    case VertexFormat.Snorm16x4:
      return { size: 4, type: gl.SHORT, normalized: true };

    case VertexFormat.Sint16:
      return { size: 1, type: gl.SHORT, normalized: false };
    case VertexFormat.Sint16x2:
      return { size: 2, type: gl.SHORT, normalized: false };
    case VertexFormat.Sint16x3:
      return { size: 3, type: gl.SHORT, normalized: false };
    case VertexFormat.Sint16x4:
      return { size: 4, type: gl.SHORT, normalized: false };

    // 32-bit int
    case VertexFormat.Uint32:
      return { size: 1, type: gl.UNSIGNED_INT, normalized: false };
    case VertexFormat.Uint32x2:
      return { size: 2, type: gl.UNSIGNED_INT, normalized: false };
    case VertexFormat.Uint32x3:
      return { size: 3, type: gl.UNSIGNED_INT, normalized: false };
    case VertexFormat.Uint32x4:
      return { size: 4, type: gl.UNSIGNED_INT, normalized: false };

    case VertexFormat.Sint32:
      return { size: 1, type: gl.INT, normalized: false };
    case VertexFormat.Sint32x2:
      return { size: 2, type: gl.INT, normalized: false };
    case VertexFormat.Sint32x3:
      return { size: 3, type: gl.INT, normalized: false };
    case VertexFormat.Sint32x4:
      return { size: 4, type: gl.INT, normalized: false };

    // 32-bit floating point
    case VertexFormat.Float32:
      return { size: 1, type: gl.FLOAT, normalized: false };
    case VertexFormat.Float32x2:
      return { size: 2, type: gl.FLOAT, normalized: false };
    case VertexFormat.Float32x3:
      return { size: 3, type: gl.FLOAT, normalized: false };
    case VertexFormat.Float32x4:
      return { size: 4, type: gl.FLOAT, normalized: false };

    default:
      throw new Error(`Unsupported VertexFormat: ${format}`);
  }
}

/**
 * @typedef WebGLAtttributeParams
 * @property {number} size
 * @property {GLenum} type
 * @property {boolean} normalized
 */