import { Mesh, Attribute } from '../mesh/index.js';
import { BasicMaterial } from '../material/index.js';
import { MeshMaterial3D, Object3D } from '../objects/index.js';
import { Loader } from './loader.js';
import { arrayBufferToText } from './utils.js';
import { SeparateAttributeData } from '../mesh/attributedata/separate.js';

/**
 * @extends {Loader<Object3D, ObjLoadSettings>}
 */
export class OBJLoader extends Loader {

  constructor() {
    super(Object3D)
  }

  /**
   * @override
   * @param {ArrayBuffer[]} buffers
   * @param {Object3D} destination
   * @param {ObjLoadSettings} _settings
   */
  async parse(buffers, destination, _settings) {
    const buffer = buffers[0]
    if (!buffer) {
      return
    }
    const raw = arrayBufferToText(buffer)
    const obj = await loadOBJ(raw)
    const attributes = new SeparateAttributeData()
    const position = obj.attributes.get(Attribute.Position.name)
    const normals = obj.attributes.get(Attribute.Normal.name)
    const uvs = obj.attributes.get(Attribute.UV.name)

    if (position) {
      attributes.set(Attribute.Position.name, position)
    }

    if (normals) {
      attributes.set(Attribute.Normal.name, normals)
    }

    if (uvs) {
      attributes.set(Attribute.UV.name, uvs)
    }
    const mesh = new Mesh(attributes)
    const root = new MeshMaterial3D(mesh, new BasicMaterial())

    destination.add(root)
  }

  /**
   * @override
   */
  default() {
    return new Object3D()
  }
}

/**
 * @param {string} data 
 */
async function loadOBJ(data) {
  const positions = []
  const uvs = []
  const normals = []
  const faces = []

  const lines = data.split("\n")

  for (let line of lines) {
    line = line.trim();

    // skip empty & comments
    if (line === "" || line.startsWith("#")) continue;

    const parts = line.split(/\s+/);
    const keyword = parts[0];
    const data = parts.slice(1);

    switch (keyword) {
      case "v": // vertex position
        positions.push(data.map(Number));
        break;
      case "vt": // uv
        uvs.push(data.map(Number));
        break;
      case "vn": // normal
        normals.push(data.map(Number));
        break;
      case "f": { // face
        const face = data.map(ref => {
          const [v, vt, vn] = ref
            .split("/")
            .map(x => x ? parseInt(x) : undefined);

          return {
            v: v !== undefined ? v - 1 : undefined,   // OBJ is 1-based → shift to 0-based
            vt: vt !== undefined ? vt - 1 : undefined,
            vn: vn !== undefined ? vn - 1 : undefined
          };
        });
        faces.push(face);
        break;
      }
    }
  }

  return buildBuffers({
    positions,
    uvs,
    normals,
    triangles: faces
  })
}

/**
 * @param {{ positions: any; uvs: any; normals: any; triangles: any; }} data
 */
function buildBuffers(data) {
  const positions = [];
  const uvs = [];
  const normals = [];

  for (const triangle of data.triangles) {
    for (let i = 1; i < triangle.length - 1; i++) {
      const vertex1 = triangle[0]
      const vertex2 = triangle[i]
      const vertex3 = triangle[i + 1]

      positions.push(...data.positions[vertex1.v])
      normals.push(...data.normals[vertex1.vn])
      uvs.push(...data.uvs[vertex1.vt])

      positions.push(...data.positions[vertex2.v])
      normals.push(...data.normals[vertex2.vn])
      uvs.push(...data.uvs[vertex2.vt])

      positions.push(...data.positions[vertex3.v])
      normals.push(...data.normals[vertex3.vn])
      uvs.push(...data.uvs[vertex3.vt])
    }
  }

  // This does not properly account for when some faces lack attributes
  // // It should lack the attribute for all faces if missing in some faces
  // Also, position should be required.
  return {
    attributes: new Map([
      [Attribute.Position.name, new DataView(new Float32Array(positions).buffer)],
      [Attribute.UV.name, new DataView(new Float32Array(uvs).buffer)],
      [Attribute.Normal.name, new DataView(new Float32Array(normals).buffer)]
    ]),
    count: positions.length / 3
  };
}


/**
 * @typedef {import('./loader.js').LoadSettings} ObjLoadSettings
 */