import { geometries } from '../../demos/samples/geometries.js';
import { Attribute, AttributeData } from '../core/index.js';
import { Geometry } from '../geometry/index.js';
import { BasicMaterial } from '../material/basicmaterial.js';
import { Mesh, Object3D } from '../mesh/index.js';

export class GLTFLoader {
  /**
   * @type {Map<string,Object3D>}
  */
  roots = new Map()
  /**
   * @param {GLTFLoadSettings} settings
   */
  load(settings) {
    const root = new Object3D()
    this.asyncLoad(settings, root)
    return root
  }

  /**
   * @param {GLTFLoadSettings} settings
   * @param {Object3D} [root]
   */
  async asyncLoad(settings, root) {
    const response = await fetch(settings.path)
    const cachedRoot = new Object3D()
    const {
      scene,
      scenes,
      nodes,
      meshes,
      bufferViews,
      buffers,
      accessors
    } = await loadGLTF(response)

    const geometries = meshes.map((data) => {
      const results = []
      for (let i = 0; i < data.primitives.length; i++) {
        const primitive = data.primitives[i];
        const mesh = new Geometry()
        if (primitive.indices !== undefined) {
          const [dataView, accessor] = getAccessorData(
            primitive.indices,
            accessors, bufferViews,
            buffers
          )
          const indices =
            accessor.componentType == AccessorComponentType.UnsignedShort ?
              new Uint16Array(
                dataView.buffer,
                dataView.byteOffset / Uint16Array.BYTES_PER_ELEMENT,
                dataView.byteLength / Uint16Array.BYTES_PER_ELEMENT
              ) :
              new Uint32Array(
                dataView.buffer,
                dataView.byteOffset / Uint32Array.BYTES_PER_ELEMENT,
                dataView.byteLength / Uint32Array.BYTES_PER_ELEMENT
              )
          mesh.indices = indices
        }
        for (const [name, location] of primitive.attributes) {
          const [buffer] = getAccessorData(
            location,
            accessors, bufferViews,
            buffers,
          )
          mesh.setAttribute(
            mapAccessorTypeToAttribute(name),
            new AttributeData(buffer))
        }
        results.push(mesh)
      }
      return results
    })

    const objects = nodes.map((node) => {
      const { mesh } = node
      const meshData = meshes[mesh]
      const geometry = geometries[mesh]

      if (!meshData || !geometries) {
        throw "Invalid mesh index on node"
      }
      let object
      if (geometry.length === 1) {
        object = new Mesh(geometry[0], new BasicMaterial())
      } else {
        object = new Object3D()
        for (let i = 0; i < geometry.length; i++) {
          const mesh = new Mesh(geometry[i], new BasicMaterial())
          object.add(mesh)
        }
      }

      return object
    })

    cachedRoot.add(...objects)
    if(root){
      root.add(...cachedRoot.children.map(c=>c.clone()))
    }
    this.roots.set(settings.name, cachedRoot)
    return cachedRoot
  }

  /**
   * @param {string} name
   * @returns {Object3D}
   */
  get(name) {
    return this.roots.get(name)
  }
}

/**
 * @param {Response} data 
 */
async function loadGLTF(data) {
  const json = await data.json()
  const { buffers: urlBuffers } = json
  const buffers = urlBuffers instanceof Array ? await loadBuffers(urlBuffers) : []
  const gltf = GLTF.deserialize(json)
  gltf.buffers = buffers

  return gltf
}

/**
 * @param {{uri:string}[]} uris
 */
async function loadBuffers(uris) {
  return Promise.all(
    uris.map(async (buffer) => {
      const response = await fetch(buffer.uri);
      if (!response.ok) throw new Error(`Failed to fetch buffer`);
      return await response.arrayBuffer();
    })
  )
}
/**
 * @typedef GLTFLoadSettings
 * @property {string} path
 * @property {string} [name]
 */

class GLTF {
  /**
   * @type {number}
   */
  scene
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
   * @param {any} data
   */
  static deserialize(data) {
    const { scene, scenes, nodes, meshes, bufferViews, accessors, asset } = data
    const gltf = new GLTF()

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

    if (typeof scene === "number") {
      gltf.scene = scene || 0
    }
    gltf.metaData = GLTFMetaData.deserialize(asset)
    gltf.scenes = scenes.map((/**@type {any}*/d) => GLTFScene.deserialize(d))
    gltf.nodes = nodes.map((/**@type {any}*/d) => GLTFNode.deserialize(d))
    gltf.meshes = meshes.map((/**@type {any}*/d) => GLTFMesh.deserialize(d))
    gltf.bufferViews = bufferViews.map((/**@type {any}*/d) => GLTFBufferView.deserialize(d))
    gltf.accessors = accessors.map((/**@type {any}*/d) => GLTFAccessor.deserialize(d))

    return gltf
  }
}

class GLTFScene {
  /**
   * @type {number[]}
   */
  nodes = []

  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { nodes } = data
    const scene = new GLTFScene()

    if (nodes instanceof Array) {
      scene.nodes = nodes
        .filter((node) => typeof node == "number")
    }
    return scene
  }
}

class GLTFNode {
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
   * @type {number[] | undefined}
   */
  children
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
      children, skin, camera } = data
    const node = new GLTFNode()

    if (typeof mesh === "number") {
      node.mesh = 0
    }
    if (weights instanceof Array) {
      node.weights = weights.filter(w => typeof w === "number")
    }
    if (matrix) {
      node.transform = MatrixTransform.deserialize(matrix)
    }
    if (translation && rotation && scale) {
      node.transform = TRSTransform.deserialize(translation, rotation, scale)
    }
    if (skin) {
      node.skin = skin
    }
    if (children instanceof Array) {
      node.children = children.filter(c => typeof c === "number")
    }
    if (camera) {
      node.camera = camera
    }
    return node
  }
}

class GLTFMesh {
  /**
   * @type {GLTFPrimitive[]}
   */
  primitives
  /**
   * @type {number[]}
   */
  weights = []
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { primitives, weights } = data
    const mesh = new GLTFMesh()

    if (primitives instanceof Array) {
      mesh.primitives = primitives.map((p) => GLTFPrimitive.deserialize(p))
    }

    if (weights instanceof Array) {
      mesh.weights = weights.filter(weight => typeof weight === "number")
    }
    return mesh
  }
}

class GLTFBufferView {
  /**
   * @type {number}
   */
  buffer
  /**
   * @type {number}
   */
  byteOffset
  /**
   * @type {number}
   */
  byteLength
  /**
   * @type {number}
   */
  byteStride
  /**
   * @type {number | undefined}
   */
  target
  /**
   * @param {any} data
   */
  static deserialize(data) {
    const { buffer, byteOffset = 0, byteLength, target, byteStride = 0 } = data
    const view = new GLTFBufferView()

    if (
      typeof buffer !== "number" ||
      typeof byteLength !== "number" ||
      typeof byteOffset !== "number" ||
      typeof byteStride !== "number"
    ) {
      throw "Invalid buffer view provided"
    }

    view.buffer = buffer
    view.byteOffset = byteOffset
    view.byteLength = byteLength
    view.byteStride = byteStride

    if (typeof target === "number") {
      view.target = target
    }

    return view
  }
}

class GLTFAccessor {
  /**
   * @type {boolean}
   */
  normalized
  /**
   * @type {number}
   */
  bufferView
  /**
   * @type {number}
   */
  byteOffset

  /**
   * @type {AccessorComponentType}
   */
  componentType
  /**
   * @type {number}
   */
  count
  /**
   * @type {AccessorType}
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
   * @param {any} data
   */
  static deserialize(data) {
    const { bufferView, byteOffset, componentType, count, type, max, min, normalized = true } = data
    const accessor = new GLTFAccessor()
    if (
      typeof bufferView !== "number" ||
      typeof byteOffset !== "number" ||
      typeof componentType !== "number" ||
      typeof count !== "number" ||
      typeof normalized !== "boolean"
    ) {
      throw "Invalid accessor"
    }

    accessor.bufferView = bufferView
    accessor.byteOffset = byteOffset
    accessor.componentType = mapComponentType(componentType)
    accessor.count = count
    accessor.type = mapAccessorType(type)

    if (max instanceof Array) {
      accessor.max = max
    }

    if (min instanceof Array) {
      accessor.min = min
    }

    return accessor
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
   * @param {any} data
   */
  static deserialize(data) {
    const { version, generator } = data
    const meta = new GLTFMetaData()
    if (typeof version === "string") {
      meta.version = version
    } else {
      throw "GLTF asset version is required"
    }

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
   * @type {PrimitiveMode}
   */
  mode
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
      this.mode = PrimitiveMode.Triangles
    }
    return primitive
  }
}

/**
 * Enum of GLTF's semantic mesh attribute names.
 * @readonly
 * @enum {string}
 */
export const GLTFAttributeName = {
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
}


/**
 * @enum {number}
 */
export const AccessorComponentType = {
  Byte: 0x1400,
  UnsignedByte: 0x1401,
  Short: 0x1402,
  UnsignedShort: 0x1403,
  UnsignedInt: 0x1405,
  Float: 0x1406
};

/**
 * @enum {number}
 */
export const AccessorType = {
  Scalar: 0,
  Vec2: 1,
  Vec3: 2,
  Vec4: 3,
  Mat2: 4,
  Mat3: 5,
  Mat4: 6
};

/**
 * @enum {number}
 */
export const PrimitiveMode = {
  Points: 0,
  Lines: 1,
  LineLoop: 2,
  LineStrip: 3,
  Triangles: 4,
  TriangleStrip: 5,
  TriangleFan: 6
};


/**
 * Maps a raw glTF accessor type string to a valid AccessorType enum value.
 * @param {string} typeString - Raw type from the glTF JSON (e.g. "VEC3", "MAT4").
 * @returns {AccessorType} One of the AccessorType values.
 * @throws {Error} If the type is not recognized.
 */
function mapAccessorType(typeString) {
  switch (typeString.toUpperCase()) {
    case "SCALAR": return AccessorType.Scalar;
    case "VEC2": return AccessorType.Vec2;
    case "VEC3": return AccessorType.Vec3;
    case "VEC4": return AccessorType.Vec4;
    case "MAT2": return AccessorType.Mat2;
    case "MAT3": return AccessorType.Mat3;
    case "MAT4": return AccessorType.Mat4;
    default:
      throw new Error(`Unknown accessor type: ${typeString}`);
  }
}

/**
 * Maps a raw glTF accessor component type string to a valid AccessorComponentType enum value.
 * @param {number} value - Raw type from the glTF JSON (e.g. "VEC3", "MAT4").
 * @returns {AccessorType} One of the AccessorType values.
 * @throws {Error} If the component type is not recognized.
 */
function mapComponentType(value) {
  switch (value) {
    case 0x1400: return AccessorComponentType.Byte;
    case 0x1401: return AccessorComponentType.UnsignedByte;
    case 0x1402: return AccessorComponentType.Short;
    case 0x1403: return AccessorComponentType.UnsignedShort;
    case 0x1405: return AccessorComponentType.UnsignedInt;
    case 0x1406: return AccessorComponentType.Float;
    default:
      throw new Error(`Unknown accessor component type: ${value}`);
  }
}

/**
 * @param {number} mode
 */
export function mapPrimitiveMode(mode) {
  switch (mode) {
    case 0: return PrimitiveMode.Points;
    case 1: return PrimitiveMode.Lines;
    case 2: return PrimitiveMode.LineLoop;
    case 3: return PrimitiveMode.LineStrip;
    case 4: return PrimitiveMode.Triangles;
    case 5: return PrimitiveMode.TriangleStrip;
    case 6: return PrimitiveMode.TriangleFan;
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
   * @type {[number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number]}
   */
  value

  /**
 * @param {any} data
 */
  static deserialize(data) {
    const transform = new MatrixTransform()

    if (
      !(data instanceof Array)
    ) {
      throw "Invalid transform"
    }

    //@ts-ignore
    transform.value = data.filter((data) => typeof data === "number")
    return transform
  }
}

/**
 * 
 * @param {number} index 
 * @param {GLTFAccessor[]} accessors 
 * @param {GLTFBufferView[]} bufferViews 
 * @param {ArrayBuffer[]} buffers 
 * @returns {[DataView,GLTFAccessor]}
 */
function getAccessorData(index, accessors, bufferViews, buffers) {
  const accessor = accessors[index]

  if (!accessor) throw "Invalid access to accessors"

  const view = bufferViews[accessor.bufferView]

  if (!view) throw "Invalid access to buffer views"

  const buffer = buffers[view.buffer]

  if (!buffer) throw "Invalid access to buffer"

  return [
    new DataView(buffer, view.byteOffset + accessor.byteOffset, view.byteLength),
    accessor
  ]
}

/**
 * @param {string} name
 * @returns {string}
 */
function mapAccessorTypeToAttribute(name) {
  switch (name) {
    case GLTFAttributeName.Position:
      return Attribute.Position.name
    case GLTFAttributeName.TexCoord0:
      return Attribute.UV.name
    case GLTFAttributeName.TexCoord1:
      return Attribute.UVB.name
    case GLTFAttributeName.Normal:
      return Attribute.Normal.name
    case GLTFAttributeName.Tangent:
      return Attribute.Tangent.name
    case GLTFAttributeName.Color0:
      return Attribute.Color.name
    case GLTFAttributeName.Weights0:
      return Attribute.JointWeight.name
    case GLTFAttributeName.Joints0:
      return Attribute.JointIndex.name
    default:
      return name;
  }
}