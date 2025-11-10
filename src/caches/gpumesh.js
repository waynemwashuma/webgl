import { BufferType, BufferUsage, GlDataType } from "../constant.js"
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

    assert(attribute,"The mesh vertex layout is incorrectly set up for the provided mesh.")

    const data = attributes.get(attribute.name)

    assert(data,`The provided mesh does not have the vertex attribute ${attribute.name}`)

    // This only works for separate buffers for each vertex attribute.
    const buffer = createBuffer(context, BufferType.Array, data.byteLength)
    const count = data.byteLength / (attribute.size * getByteSize(attribute.type))
    
    updateBuffer(context, BufferType.Array, data)
    context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW)
    setVertexAttribute(context, attribute.id, attribute.type, attribute.size)
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
 *
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 * @param {number} index - The attribute location.
 * @param {GlDataType} type - One of the values from GlDataType.
 * @param {number} size - Number of components per attribute (1-4).
 * @param {number} [stride = 0] - Byte stride between attributes.
 * @param {number} [offset = 0] - Byte offset of the first attribute.
 * @param {boolean} [normalized = false] - Whether fixed-point values should be normalized.
 */
function setVertexAttribute(gl, index, type, size, stride = 0, offset = 0, normalized = false) {
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
      gl.vertexAttribIPointer(index, size, type, stride, offset);
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