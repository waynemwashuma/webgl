import { Attribute, AttributeData } from '../core/index.js';
import { Mesh } from '../mesh/index.js';
import { BasicMaterial } from '../material/basicmaterial.js';
import { MeshMaterial3D } from '../objects/index.js';

export class OBJLoader {
  /**
   * @type {Map<string,MeshMaterial3D>}
  */
  meshes = new Map()
  /**
   * @param {ObjSettings} settings
   */
  async load(settings) {
    const raw = await (await fetch(settings.path)).text()
    const { attributes,count } = await loadOBJ(raw)
    const geometry = new Mesh()
    const mesh = new MeshMaterial3D(geometry, new BasicMaterial())
    
    
    geometry.setAttribute(Attribute.Position.name,new AttributeData(attributes.get(Attribute.Position.name)))
    geometry.setAttribute(Attribute.Normal.name,new AttributeData(attributes.get(Attribute.Normal.name)))
    geometry.setAttribute(Attribute.UV.name,new AttributeData(attributes.get(Attribute.UV.name)))
    this.meshes.set(settings.name, mesh)

    return mesh
  }


  /**
   * @param {string} name
   * @returns {MeshMaterial3D}
   */
  get(name) {
    return this.meshes.get(name)
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
          const [v, vt, vn] = ref.split("/").map(x => x ? parseInt(x) : null);
          return {
            v: v !== null ? v - 1 : null,   // OBJ is 1-based → shift to 0-based
            vt: vt !== null ? vt - 1 : null,
            vn: vn !== null ? vn - 1 : null
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
      [Attribute.Position.name,new DataView(new Float32Array(positions).buffer)],
      [Attribute.UV.name, new DataView(new Float32Array(uvs).buffer)],
      [Attribute.Normal.name, new DataView(new Float32Array(normals).buffer)]
    ]),
    count: positions.length / 3
  };
}


/**
 * @typedef ObjSettings
 * @property {string} path
 * @property {string} [name]
 */