/**@import { LoadSettings } from './loader.js' */
import { Attribute, Mesh, VertexFormat } from '../mesh/index.js';
import { BasicMaterial } from '../material/index.js';
import { MeshMaterial3D, Object3D, Skin } from '../objects/index.js';
import { Loader } from './loader.js';
import { arrayBufferToJSON } from './utils.js';
import { Bone3D } from '../objects/bone.js';
import { Affine3 } from '../math/index.js';
import { GlDataType } from '../constant.js';
import { SeparateAttributeData } from '../mesh/attributedata/separate.js';

/**
 * @extends {Loader<Object3D, GLTFLoadSettings>}
 */
export class GLTFLoader extends Loader {

  constructor() {
    super(Object3D)
  }
  /**
   * @override
   * @param {ArrayBuffer[]} buffers
   * @param {Object3D} destination
   * @param {GLTFLoadSettings} settings
   */
  async parse(buffers, destination, settings) {
    const buffer = buffers[0]
    const path = settings.paths[0]
    if (!buffer || !path) {
      return
    }

    /**@type {Map<number, Object3D>} */
    const entityMap = new Map()
    const gltf = await loadGLTF(buffer, path)
    const scene = gltf.scenes[gltf.scene]

    if (!scene) {
      throw "No root scene defined"
    }

    const geometries = gltf.meshes.map((data) => {
      return parseGeometry(data, gltf)
    })

    gltf.nodes.forEach((node, index) => {
      const object = parseObject(index, node, gltf, geometries)

      if (object) {
        entityMap.set(index, object)
      }
    })

    gltf.nodes.forEach((node, index) => {
      const parent = entityMap.get(index)

      if (!parent) {
        return
      }

      for (const child of node.children) {
        const childEntity = entityMap.get(child)

        if (childEntity) {
          parent.add(childEntity)
        }
      }
    })

    scene.nodes.forEach((node) => {
      entityMap.get(node)?.update()
    });

    const skins = gltf.skins.map((skin) => {
      return parseSkin(skin, gltf, entityMap)
    })

    entityMap.forEach((entity, index) => {
      const node = /**@type {GLTFNode} */ (gltf.nodes[index])
      if (node.skin !== undefined) {
        entity.traverseBFS((mesh) => {
          if (mesh instanceof MeshMaterial3D) {
            mesh.skin = skins[/**@type {number} */ (node.skin)]
          }
          return true
        })
      }
    })

    const sceneEntities = scene.nodes.map((node) => {
      return /**@type {Object3D} */ (entityMap.get(node))
    })

    destination.add(...sceneEntities)
  }

  /**
   * @override
   */
  default() {
    return new Object3D()
  }
}

/**
 * @param {ArrayBuffer} data
 * @param {string} baseUrl
 */
async function loadGLTF(data, baseUrl) {
  const url = new URL(baseUrl, location.href)
  const json = arrayBufferToJSON(data)
  const { buffers: urlBuffers } = json
  const buffers = urlBuffers instanceof Array ? await loadBuffers(url.href, urlBuffers) : []
  const gltf = GLTF.deserialize(json)
  gltf.buffers = buffers

  return gltf
}

/**
 * @param {string} base
 * @param {{uri: string;}[]} uris
 */
async function loadBuffers(base, uris) {

  return Promise.all(
    uris.map(async (buffer) => {
      const url = buffer.uri.startsWith('data') ?
        buffer.uri :
        new URL(buffer.uri, base).pathname
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch buffer`);
      return await response.arrayBuffer();
    })
  )
}
/**
 * @typedef {LoadSettings} GLTFLoadSettings
 */

class GLTF {
  /**
   * @type {number}
   */
  scene = 0
  /**
   * @type {GLTFScene[]}
   */
  scenes = []
  /**
   * @type {GLTFNode[]}
   */
  nodes = []
  /**
   * @type {GLTFMesh[]}
   */
  meshes = []
  /**
   * @type {GLTFSkin[]}
   */
  skins = []
  /**
   * @type {ArrayBuffer[]}
   */
  buffers = []
  /**
   * @type {GLTFBufferView[]}
   */
  bufferViews = []
  /**
   * @type {GLTFAccessor[]}
   */
  accessors = []
  /**
   * @type {GLTFMetaData}
   */
  metaData

  /**
   * @param {GLTFMetaData} meta
   */
  constructor(meta) {
    this.metaData = meta
  }
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { scene, scenes, nodes, meshes, bufferViews, accessors, asset, skins } = data

    if (
      !(asset instanceof Object) ||
      !(scenes instanceof Array) ||
      !(nodes instanceof Array) ||
      !(meshes instanceof Array) ||
      !(bufferViews instanceof Array) ||
      !(accessors instanceof Array)
    ) {
      throw new Error("Invalid gltf json")
    }
    const gltf = new GLTF(GLTFMetaData.deserialize(asset))

    if (typeof scene === "number") {
      gltf.scene = scene
    } else {
      gltf.scene = 0
    }

    gltf.scenes = scenes.map((/**@type {any}*/d) => GLTFScene.deserialize(d))
    gltf.nodes = nodes.map((/**@type {any}*/d) => GLTFNode.deserialize(d))
    gltf.meshes = meshes.map((/**@type {any}*/d) => GLTFMesh.deserialize(d))
    gltf.bufferViews = bufferViews.map((/**@type {any}*/d) => GLTFBufferView.deserialize(d))
    gltf.accessors = accessors.map((/**@type {any}*/d) => GLTFAccessor.deserialize(d))

    if (skins instanceof Array) {
      gltf.skins = skins.map(a => GLTFSkin.deserialize(a))
    } else {
      gltf.skins = []
    }
    return gltf
  }
}

class GLTFScene {
  /**
   * @type {string}
   */
  name = ''
  /**
   * @type {Record<string,any>}
   */
  extensions = {}
  /**
   * @type {Record<string,any>}
   */
  extras = []
  /**
   * @type {number[]}
   */
  nodes = []

  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { nodes, name, extensions, extras } = data
    const scene = new GLTFScene()

    if (nodes instanceof Array) {
      scene.nodes = nodes
        .filter((node) => typeof node == "number")
    }

    if (name === "string") {
      scene.name = name
    } else {
      scene.name = ''
    }
    if (extensions instanceof Object) {
      scene.extensions = extensions
    } else {
      scene.extensions = {}
    }
    if (extras instanceof Object) {
      scene.extras = extras
    } else {
      scene.extras = {}
    }
    return scene
  }
}

class GLTFNode {
  /**
   * @type {string}
   */
  name = ''
  /**
   * @type {Record<string,any>}
   */
  extensions = {}
  /**
   * @type {Record<string,any>}
   */
  extras = []
  /**
   * @type {number | undefined}
   */
  mesh
  /**
   * @type {number | undefined}
   */
  skin

  /**
   * @type {number | undefined}
   */
  camera
  /**
   * @type {number[] | undefined}
   */
  weights
  /**
   * @type {number[]}
   */
  children = []
  /**
   * @type {TRSTransform | MatrixTransform | undefined}
   */
  transform
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const {
      mesh, matrix, translation,
      rotation, scale, weights,
      children, skin, camera,
      name, extensions, extras
    } = data
    const node = new GLTFNode()

    if (typeof mesh === "number") {
      node.mesh = mesh
    }
    if (typeof skin === 'number') {
      node.skin = skin
    }
    if (typeof camera === 'number') {
      node.camera = camera
    }
    if (weights instanceof Array) {
      node.weights = weights.filter(w => typeof w === "number")
    }
    if (matrix) {
      node.transform = MatrixTransform.deserialize(matrix)
    }
    if (translation || rotation || scale) {
      const ntranslation = translation || [0, 0, 0]
      const nrotation = rotation || [0, 0, 0, 1]
      const nscale = scale || [1, 1, 1]
      node.transform = TRSTransform.deserialize(
        ntranslation,
        nrotation,
        nscale
      )
    } else if (matrix) {
      node.transform = MatrixTransform.deserialize(matrix)
    } else {
      node.transform = new TRSTransform()
    }

    if (children instanceof Array) {
      node.children = children.filter(c => typeof c === "number")
    } else {
      node.children = []
    }

    if (typeof name === 'string') {
      node.name = name
    } else {
      node.name = ""
    }
    if (extensions instanceof Object) {
      node.extensions = extensions
    } else {
      node.extensions = {}
    }
    if (extras instanceof Object) {
      node.extras = extras
    } else {
      node.extras = {}
    }
    return node
  }
}

class GLTFMesh {
  /**
   * @type {string}
   */
  name = ''
  /**
   * @type {Record<string,any>}
   */
  extensions = {}
  /**
   * @type {Record<string,any>}
   */
  extras = []
  /**
   * @type {GLTFPrimitive[]}
   */
  primitives = []
  /**
   * @type {number[]}
   */
  weights = []
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { primitives, weights, name, extensions, extras } = data
    const mesh = new GLTFMesh()

    if (primitives instanceof Array) {
      mesh.primitives = primitives.map((p) => GLTFPrimitive.deserialize(p))
    } else {
      mesh.primitives = []
    }

    if (weights instanceof Array) {
      mesh.weights = weights.filter(weight => typeof weight === "number")
    } else {
      mesh.weights = []
    }

    if (typeof name === "string") {
      mesh.name = name
    } else {
      mesh.name = ''
    }
    if (extensions instanceof Object) {
      mesh.extensions = extensions
    } else {
      mesh.extensions = {}
    }
    if (extras instanceof Object) {
      mesh.extras = extras
    } else {
      mesh.extras = {}
    }
    return mesh
  }
}

class GLTFSkin {
  /**
   * @type {number}
   */
  inverseBindMatrices

  /**
   * @type {number | undefined}
   */
  skeleton
  /**
   * @type {number[]}
   */
  joints

  /**
   * @param {number[]} joints
   * @param {number} inverseBindMatrices
   */
  constructor(joints, inverseBindMatrices) {
    this.inverseBindMatrices = inverseBindMatrices
    this.joints = joints
  }

  /**

   * @param {any} data 
   */
  static deserialize(data) {
    const { joints, inverseBindMatrices, skeleton } = data

    if (
      !(joints instanceof Array) ||
      typeof inverseBindMatrices !== 'number'
    ) {
      throw 'Invalid skin'
    }
    const object = new GLTFSkin(
      joints.filter(e => typeof e === 'number'),
      inverseBindMatrices
    )

    if (typeof skeleton === 'number') {
      object.skeleton = skeleton
    }
    return object
  }
}

class GLTFBufferView {
  /**
   * @type {string}
   */
  name = ''
  /**
   * @type {Record<string,any>}
   */
  extensions = {}
  /**
   * @type {Record<string,any>}
   */
  extras = []
  /**
   * @type {number}
   */
  buffer
  /**
   * @type {number}
   */
  offset = 0
  /**
   * @type {number}
   */
  length
  /**
   * @type {number}
   */
  stride = 0
  /**
   * @type {number | undefined}
   */
  target

  /**
   * @param {number} buffer
   * @param {number} length
   */
  constructor(buffer, length) {
    this.buffer = buffer
    this.length = length
  }

  /**
   * @param {any} data
   */
  static deserialize(data) {
    const {
      buffer,
      byteOffset,
      byteLength,
      target,
      byteStride,
      name,
      extensions,
      extras
    } = data

    if (
      typeof buffer !== "number" ||
      typeof byteLength !== "number"
    ) {
      throw "Invalid buffer view provided"
    }

    const struct = new GLTFBufferView(buffer, byteLength)

    if (typeof byteOffset === "number") {
      struct.offset = byteOffset
    } else {
      struct.offset = 0
    }

    if (typeof byteStride === "number") {
      struct.stride = byteStride
    } else {
      struct.stride = 0
    }

    if (typeof target === "number") {
      struct.target = target
    }

    if (typeof name === 'string') {
      struct.name = name
    } else {
      struct.name = ""
    }
    if (extensions instanceof Object) {
      struct.extensions = extensions
    } else {
      struct.extensions = {}
    }
    if (extras instanceof Object) {
      struct.extras = extras
    } else {
      struct.extras = {}
    }
    return struct
  }
}

class GLTFAccessor {
  /**
   * @type {string}
   */
  name = ''
  /**
   * @type {Record<string,any>}
   */
  extensions = {}
  /**
   * @type {Record<string,any>}
   */
  extras = {}
  /**
   * @type {boolean}
   */
  normalized = false
  /**
   * @type {number}
   */
  view = 0
  /**
   * @type {number}
   */
  offset = 0
  /**
   * @type {GLTFComponentType}
   */
  componentType
  /**
   * @type {number}
   */
  count
  /**
   * @type {GLTFAccessorType}
   */
  type
  /**
   * @type {number[] | undefined}
   */
  max
  /**
   * @type {number[] | undefined}
   */
  min

  /**
   * @param {number} type
   * @param {number} componentType
   * @param {number} count
   */
  constructor(type, componentType, count) {
    this.type = type
    this.componentType = componentType
    this.count = count
  }
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const {
      bufferView,
      byteOffset,
      componentType,
      count,
      type,
      max,
      min,
      normalized,
      sparse,
      name,
      extensions,
      extras
    } = data

    if (
      typeof componentType !== "number" ||
      typeof type !== "string" ||
      typeof count !== "number"
    ) {
      throw "Invalid accessor"
    }
    const struct = new GLTFAccessor(
      mapAccessorType(type),
      mapComponentType(componentType),
      count
    )

    if (typeof bufferView === "number") {
      struct.view = bufferView
    } else {
      if (sparse instanceof Object) {
        throw "Sparse accessors are not yet supported"
      } else {
        throw "No buffer view to index into for accessor"
      }
    }

    if (typeof byteOffset === "number") {
      struct.offset = byteOffset
    } else {
      struct.offset = 0
    }

    if (typeof normalized === "boolean") {
      struct.normalized = normalized
    } else {
      struct.normalized = false
    }

    if (max instanceof Array) {
      struct.max = max
    }

    if (min instanceof Array) {
      struct.min = min
    }

    if (typeof name === 'string') {
      struct.name = name
    } else {
      struct.name = ""
    }
    if (extensions instanceof Object) {
      struct.extensions = extensions
    } else {
      struct.extensions = {}
    }
    if (extras instanceof Object) {
      struct.extras = extras
    } else {
      struct.extras = {}
    }
    return struct
  }
}

class GLTFMetaData {
  /**
   * @type {string}
   */
  version
  /**
   * @type {string | undefined}
   */
  generator

  /**
   * @param {string} version
   */
  constructor(version) {
    this.version = version
  }
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { version, generator } = data

    if (typeof version !== "string") {
      throw "GLTF asset version is required"
    }

    const meta = new GLTFMetaData(version)
    if (typeof generator === "string") {
      meta.generator = generator
    }
    return meta
  }
}

class GLTFPrimitive {
  /**
   * @type {Map<GLTFAttributeName,number>}
   */
  attributes = new Map()
  /**
   * @type {number | undefined}
   */
  indices
  /**
   * @type {GLTFPrimitiveMode}
   */
  mode = GLTFPrimitiveMode.Triangles
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { attributes, indices, mode } = data
    const primitive = new GLTFPrimitive()

    if (typeof indices === "number") {
      primitive.indices = indices
    }

    if (attributes instanceof Object) {
      for (const key in attributes) {
        const value = attributes[key]
        if (typeof value === "number") {
          primitive.attributes.set(key, value)
        }
      }
    }
    if (typeof mode === "number") {
      this.mode = mapPrimitiveMode(mode)
    } else {
      this.mode = GLTFPrimitiveMode.Triangles
    }
    return primitive
  }
}

/**
 * Enum of GLTF's semantic mesh attribute names.
 * @enum {string}
 */
export const GLTFAttributeName = /**@type {const}*/({
  /** Vertex positions */
  Position: "POSITION",
  /** Vertex normals */
  Normal: "NORMAL",
  /** Vertex tangents */
  Tangent: "TANGENT",
  /** Vertex texture coordinates set 0 */
  TexCoord0: "TEXCOORD_0",
  /** Vertex texture coordinates set 1 */
  TexCoord1: "TEXCOORD_1",
  /** Vertex colors set 0 */
  Color0: "COLOR_0",
  /** Joint indices for skinning set 0 */
  Joints0: "JOINTS_0",
  /** Joint weights for skinning set 0 */
  Weights0: "WEIGHTS_0"
})

/**
 * @enum {number}
 */
export const GLTFComponentType = /**@type {const}*/({
  Byte: 0x1400,
  UnsignedByte: 0x1401,
  Short: 0x1402,
  UnsignedShort: 0x1403,
  Int: 0x1404,
  UnsignedInt: 0x1405,
  Float: 0x1406
})

/**
 * @enum {number}
 */
export const GLTFAccessorType = /**@type {const}*/({
  Scalar: 0,
  Vec2: 1,
  Vec3: 2,
  Vec4: 3,
  Mat2: 4,
  Mat3: 5,
  Mat4: 6
})

/**
 * @enum {number}
 */
export const GLTFPrimitiveMode = /**@type {const}*/({
  Points: 0,
  Lines: 1,
  LineLoop: 2,
  LineStrip: 3,
  Triangles: 4,
  TriangleStrip: 5,
  TriangleFan: 6
})

/**
 * Maps a raw glTF accessor type string to a valid AccessorType enum value.
 * @param {string} typeString - Raw type from the glTF JSON (e.g. "VEC3", "MAT4").
 * @returns {GLTFAccessorType} One of the AccessorType values.
 * @throws {Error} If the type is not recognized.
 */
function mapAccessorType(typeString) {
  switch (typeString.toUpperCase()) {
    case "SCALAR": return GLTFAccessorType.Scalar;
    case "VEC2": return GLTFAccessorType.Vec2;
    case "VEC3": return GLTFAccessorType.Vec3;
    case "VEC4": return GLTFAccessorType.Vec4;
    case "MAT2": return GLTFAccessorType.Mat2;
    case "MAT3": return GLTFAccessorType.Mat3;
    case "MAT4": return GLTFAccessorType.Mat4;
    default:
      throw new Error(`Unknown accessor type: ${typeString}`);
  }
}

/**
 * Maps a raw glTF accessor component type string to a valid AccessorComponentType enum value.
 * @param {number} value - Raw type from the glTF JSON (e.g. "VEC3", "MAT4").
 * @returns {GLTFAccessorType} One of the AccessorType values.
 * @throws {Error} If the component type is not recognized.
 */
function mapComponentType(value) {
  switch (value) {
    case 0x1400: return GLTFComponentType.Byte;
    case 0x1401: return GLTFComponentType.UnsignedByte;
    case 0x1402: return GLTFComponentType.Short;
    case 0x1403: return GLTFComponentType.UnsignedShort;
    case 0x1405: return GLTFComponentType.UnsignedInt;
    case 0x1406: return GLTFComponentType.Float;
    default:
      throw new Error(`Unknown accessor component type: ${value}`);
  }
}

/**
 * @param {number} mode
 */
export function mapPrimitiveMode(mode) {
  switch (mode) {
    case 0: return GLTFPrimitiveMode.Points;
    case 1: return GLTFPrimitiveMode.Lines;
    case 2: return GLTFPrimitiveMode.LineLoop;
    case 3: return GLTFPrimitiveMode.LineStrip;
    case 4: return GLTFPrimitiveMode.Triangles;
    case 5: return GLTFPrimitiveMode.TriangleStrip;
    case 6: return GLTFPrimitiveMode.TriangleFan;
    default: throw "Unrecognized primitive mode: " + mode
  }
}

class TRSTransform {
  /**
   * @type {[number,number,number]}
   */
  translation
  /**
   * @type {[number,number,number,number]}
   */
  rotation
  /**
   * @type {[number,number,number]}
   */
  scale
  /**
   * @param {[number, number, number]} [translation]
   * @param {[number, number, number, number]} [rotation]
   * @param {[number, number, number]} [scale]
   */
  constructor(
    translation = [0, 0, 0],
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1]
  ) {
    this.translation = translation
    this.rotation = rotation
    this.scale = scale
  }
  /**
   * @param {any} translation
   * @param {any} rotation
   * @param {any} scale
   */
  static deserialize(translation, rotation, scale) {
    const transform = new TRSTransform()

    if (
      !(translation instanceof Array) ||
      !(rotation instanceof Array) ||
      !(scale instanceof Array)
    ) {
      throw "Invalid transform"
    }

    //@ts-ignore
    transform.translation = translation.filter((data) => typeof data === "number")
    //@ts-ignore
    transform.rotation = rotation.filter((data) => typeof data === "number")
    //@ts-ignore
    transform.scale = scale.filter((data) => typeof data === "number")
    return transform
  }
}

class MatrixTransform {
  /**
   * @type {MatrixArray}
   */
  value

  /**
   * @param {MatrixArray} value
   */
  constructor(value) {
    this.value = value
  }
  /**
 * @param {any} data
 */
  static deserialize(data) {

    if (
      !(data instanceof Array)
    ) {
      throw "Invalid transform"
    }
    const t = data.filter((data) => typeof data === "number")

    if (t.length !== 16) {
      throw "invalid matrix transform"
    }
    const transform = new MatrixTransform(/**@type {MatrixArray}*/(t))

    return transform
  }
}

/**
 * 
 * @param {number} index 
 * @param {GLTF} gltf
 * @returns {[DataView,GLTFAccessor]}
 */
function getAccessorData(index, gltf) {
  const { accessors, bufferViews, buffers } = gltf
  const accessor = accessors[index]
  if (!accessor) throw "Invalid access to accessors"

  const view = bufferViews[accessor.view]

  if (!view) throw "Invalid access to buffer views"

  const buffer = buffers[view.buffer]

  if (!buffer) throw "Invalid access to buffer"

  const byteLength = accessor.count * getComponentSize(accessor.componentType) * getElementSize(accessor.type)

  return [
    new DataView(buffer, view.offset + accessor.offset, byteLength),
    accessor
  ]
}

/**
 * @param {GLTFAccessor} accessor
 * @param {DataView} view
 */
function mapToIndices(accessor, view) {
  switch (accessor.componentType) {
    case GLTFComponentType.UnsignedByte:
      return new Uint8Array(
        view.buffer,
        view.byteOffset,
        view.byteLength / Uint8Array.BYTES_PER_ELEMENT
      )
    case GLTFComponentType.UnsignedShort:
      return new Uint16Array(
        view.buffer,
        view.byteOffset,
        view.byteLength / Uint16Array.BYTES_PER_ELEMENT
      )
    case GLTFComponentType.UnsignedInt:
      return new Uint32Array(
        view.buffer,
        view.byteOffset,
        view.byteLength / Uint32Array.BYTES_PER_ELEMENT
      )
    default:
      throw "Indices provided on a mesh is not valid"
  }
}

/**
 * @param {string} name
 * @param {GLTFAccessor} accessor
 * @param {DataView} buffer
 * @returns {[string, DataView] | undefined}
 */
function mapAccessorTypeToAttribute(name, accessor, buffer) {
  const { componentType: type } = accessor
  switch (name) {
    case GLTFAttributeName.Position:
      if (type !== mapToGLTFComponentType(Attribute.Position.format))
        throw "Attribute types do not match"
      return [Attribute.Position.name, buffer]
    case GLTFAttributeName.TexCoord0:
      if (type !== mapToGLTFComponentType(Attribute.UV.format))
        throw "Attribute types do not match"
      return [Attribute.UV.name, buffer]
    case GLTFAttributeName.TexCoord1:
      if (type !== mapToGLTFComponentType(Attribute.UVB.format))
        throw "Attribute types do not match"
      return [Attribute.UVB.name, buffer]
    case GLTFAttributeName.Normal:
      if (type !== mapToGLTFComponentType(Attribute.Normal.format))
        throw "Attribute types do not match"
      return [Attribute.Normal.name, buffer]
    case GLTFAttributeName.Tangent:
      if (type !== mapToGLTFComponentType(Attribute.Tangent.format))
        throw "Attribute types do not match"
      return [Attribute.Tangent.name, buffer]
    case GLTFAttributeName.Color0:
      if (type !== mapToGLTFComponentType(Attribute.Color.format))
        throw "Attribute types do not match"
      return [Attribute.Color.name, buffer]
    case GLTFAttributeName.Weights0:
      if (type !== mapToGLTFComponentType(Attribute.JointWeight.format))
        throw "Attribute types do not match"
      return [Attribute.JointWeight.name, buffer]
    case GLTFAttributeName.Joints0:
      if (type === mapToGLTFComponentType(Attribute.JointIndex.format)) {
        return [Attribute.JointIndex.name, buffer]
      } else if (type === GlDataType.UnsignedByte) {
        const newBuffer = widenTypedArray(
          new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
          Uint16Array
        )
        return [Attribute.JointIndex.name, new DataView(newBuffer.buffer)]
      } else {
        throw "Attribute types do not match"
      }
    default:
      return undefined;
  }
}


/**
 * @param {GLTFComponentType} componentType
 */
function getComponentSize(componentType) {
  switch (componentType) {
    case GLTFComponentType.Byte:           // 0x1400
      return 1;
    case GLTFComponentType.UnsignedByte:   // 0x1401
      return 1;
    case GLTFComponentType.Short:          // 0x1402
      return 2;
    case GLTFComponentType.UnsignedShort:  // 0x1403
      return 2;
    case GLTFComponentType.Int:            // 0x1404
      return 4;
    case GLTFComponentType.UnsignedInt:    // 0x1405
      return 4;
    case GLTFComponentType.Float:          // 0x1406
      return 4;
    default:
      return 0; // Return 0 if componentType is unknown
  }
}


/**
 * @param {GLTFAccessorType} type
 */
function getElementSize(type) {
  switch (type) {
    case GLTFAccessorType.Scalar:
      return 1;
    case GLTFAccessorType.Vec2:
      return 2;
    case GLTFAccessorType.Vec3:
      return 3;
    case GLTFAccessorType.Vec4:
      return 4;
    case GLTFAccessorType.Mat2:
      return 4;
    case GLTFAccessorType.Mat3:
      return 9;
    case GLTFAccessorType.Mat4:
      return 16;
    default:
      return 0;;
  }
}

/**
 * @param {number} mesh
 * @param {GLTFMesh[]} meshes
 * @param {Mesh[][]} geometries
 */
function parseMeshObject(mesh, meshes, geometries) {
  const meshData = meshes[mesh]
  const geometry = geometries[mesh]

  if (!meshData || !geometry) {
    throw "Invalid mesh index on node"
  }
  if (geometry.length === 1) {
    return new MeshMaterial3D(/**@type {Mesh}*/(geometry[0]), new BasicMaterial())
  }
  const object = new Object3D()
  for (let i = 0; i < geometry.length; i++) {
    const mesh = new MeshMaterial3D(/**@type {Mesh}*/(geometry[i]), new BasicMaterial())
    object.add(mesh)
  }

  return object
}

/**
 * @param {GLTFMesh} gltfMesh
 * @param {GLTF} gltf
 */
function parseGeometry(gltfMesh, gltf) {
  const results = []
  for (let i = 0; i < gltfMesh.primitives.length; i++) {
    const primitive = /**@type {GLTFPrimitive} */ (gltfMesh.primitives[i])
    const attributes = new SeparateAttributeData()
    const mesh = new Mesh(attributes)
    if (primitive.indices !== undefined) {
      const [dataView, accessor] = getAccessorData(
        primitive.indices,
        gltf
      )
      mesh.indices = mapToIndices(accessor, dataView)
    }
    for (const [name, location] of primitive.attributes) {
      const [buffer, accessor] = getAccessorData(
        location,
        gltf
      )
      const attribute = mapAccessorTypeToAttribute(name, accessor, buffer)
      if (!attribute) continue
      const [attributeName, attributeBuffer] = attribute
      attributes.set(
        attributeName,
        attributeBuffer
      )
    }

    mesh.normalizeJointWeights()

    results.push(mesh)
  }
  return results
}

/**
 * @param {GLTFSkin} gltfSkin
 * @param {GLTF} gltf
 * @param {Map<number, Object3D>} entityMap
 * @returns {Skin}
 */
function parseSkin(gltfSkin, gltf, entityMap) {
  const [bindPoseData] = getAccessorData(gltfSkin.inverseBindMatrices, gltf)
  const bindPose = convertToInverseBindPose(bindPoseData)
  const skin = new Skin()

  skin.inverseBindPose = bindPose
  skin.bones = gltfSkin.joints.map(joint => {
    const entity = entityMap.get(joint)
    if (!(entity instanceof Bone3D)) {
      throw "One of the bones is not a `Bone3D`"
    }

    return entity
  })

  // TODO: Remove when you figure what is wrong with the gltf inverse bind matrix
  // something is wrong when you are parsing it
  skin.setBindPose()
  return skin
}

/**
 * 
 * @param {DataView} poseData 
 * @returns {Affine3[]}
 */
function convertToInverseBindPose(poseData) {
  const results = []
  const data = new Float32Array(
    poseData.buffer,
    poseData.byteOffset,
    poseData.byteLength / Float32Array.BYTES_PER_ELEMENT
  )

  for (let offset = 0; offset < data.length; offset += 16) {
    const affine = new Affine3(
      data[offset + 0], data[offset + 4], data[offset + 8], data[offset + 11],
      data[offset + 1], data[offset + 5], data[offset + 9], data[offset + 12],
      data[offset + 2], data[offset + 6], data[offset + 10], data[offset + 13],
    )

    results.push(affine)
  }

  return results
}

/**
 * @param {number} index
 * @param {GLTFNode} node
 * @param {GLTF} gltf
 * @param {Mesh[][]} geometries
 */
function parseObject(index, node, gltf, geometries) {
  const { mesh, transform, name } = node

  let object
  if (mesh !== undefined) {
    object = parseMeshObject(mesh, gltf.meshes, geometries)
  } else {
    const bone = parseBone(index, gltf)

    if (bone) {
      object = bone
    } else {
      object = new Object3D()
    }
  }

  if (transform) {
    transferTransform(object, transform)
  }

  object.name = name

  return object
}

/**
 * @param {number} index
 * @param {GLTF} gltf
 * @returns {Bone3D | undefined}
 */
function parseBone(index, gltf) {
  for (const skin of gltf.skins) {
    const boneIndex = skin.joints.findIndex((v) => v === index)
    if (boneIndex !== -1) {
      const bone = new Bone3D()
      bone.index = boneIndex
      return bone
    }
  }
  return undefined
}

/**
 * @param {Object3D} object
 * @param {TRSTransform | MatrixTransform} transform
 */
function transferTransform(object, transform) {
  if (transform instanceof TRSTransform) {
    object.transform.position.x = transform.translation[0]
    object.transform.position.y = transform.translation[1]
    object.transform.position.z = transform.translation[2]
    object.transform.orientation.x = transform.rotation[0]
    object.transform.orientation.y = transform.rotation[1]
    object.transform.orientation.z = transform.rotation[2]
    object.transform.orientation.w = transform.rotation[3]
    object.transform.scale.x = transform.scale[0]
    object.transform.scale.y = transform.scale[1]
    object.transform.scale.z = transform.scale[2]
  }
  if (transform instanceof MatrixTransform) {
    throw "matrix transform not yet supported"
  }
}

/**
 * 
 * @param {TypedArray} from 
 * @param {new (...args:any[])=>TypedArray} to 
 * @returns 
 */
function widenTypedArray(from, to) {
  const result = new to(from.length);
  for (let i = 0; i < from.length; i++) {
    result[i] = /**@type {bigint | number}*/(from[i])
  }
  return result;
}

/**
 * @param {VertexFormat} vertexFormat
 */
function mapToGLTFComponentType(vertexFormat) {
  switch (vertexFormat) {
    case VertexFormat.Uint8:
    case VertexFormat.Uint8x2:
    case VertexFormat.Uint8x3:
    case VertexFormat.Uint8x4:
    case VertexFormat.Unorm8:
    case VertexFormat.Unorm8x2:
    case VertexFormat.Unorm8x3:
    case VertexFormat.Unorm8x4:
      return GLTFComponentType.UnsignedByte;
    case VertexFormat.Snorm8:
    case VertexFormat.Snorm8x2:
    case VertexFormat.Snorm8x3:
    case VertexFormat.Snorm8x4:
    case VertexFormat.Sint8:
    case VertexFormat.Sint8x2:
    case VertexFormat.Sint8x3:
    case VertexFormat.Sint8x4:
      return GLTFComponentType.Byte;
    case VertexFormat.Uint16:
    case VertexFormat.Uint16x2:
    case VertexFormat.Uint16x3:
    case VertexFormat.Uint16x4:
    case VertexFormat.Unorm16:
    case VertexFormat.Unorm16x2:
    case VertexFormat.Unorm16x3:
    case VertexFormat.Unorm16x4:
      return GLTFComponentType.UnsignedShort;
    case VertexFormat.Snorm16:
    case VertexFormat.Snorm16x2:
    case VertexFormat.Snorm16x3:
    case VertexFormat.Snorm16x4:
    case VertexFormat.Sint16:
    case VertexFormat.Sint16x2:
    case VertexFormat.Sint16x3:
    case VertexFormat.Sint16x4:
      return GLTFComponentType.Short;
    // 32-bit unsigned ints
    case VertexFormat.Uint32:
    case VertexFormat.Uint32x2:
    case VertexFormat.Uint32x3:
    case VertexFormat.Uint32x4:
      return GLTFComponentType.UnsignedInt;

    // 32-bit signed ints
    case VertexFormat.Sint32:
    case VertexFormat.Sint32x2:
    case VertexFormat.Sint32x3:
    case VertexFormat.Sint32x4:
      return GLTFComponentType.Int;
    case VertexFormat.Float32:
    case VertexFormat.Float32x2:
    case VertexFormat.Float32x3:
    case VertexFormat.Float32x4:
      return GLTFComponentType.Float
    default:
      throw new Error('Unsupported vertex format: ' + vertexFormat);
  }
}


/**
 *@typedef {Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} TypedArray
 */

/**
 * @typedef {[number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]} MatrixArray
 */