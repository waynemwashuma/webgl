import { Geometry } from "./geometry.js"
import { AttributeData } from "../core/index.js"

export class IcosphereGeometry extends Geometry {
  constructor(radius = 1, numSegments = 1) {
    super()

    const { indices, vertices, normals, uvs } = createIcoSphere(radius, numSegments);
    
    this.setAttribute("indices",
      new AttributeData(new Uint16Array(indices), 1)
    )
    this.setAttribute("position",
      new AttributeData(new Float32Array(vertices), 3)
    )
    this.setAttribute("normal", 
    new AttributeData(new Float32Array(normals), 3)
    )
    this.setAttribute("uv",
      new AttributeData(new Float32Array(uvs), 2)
    )
  }
}

function createIcoSphere(radius, subdivisions) {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  function normalize(vec) {
    const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    return [vec[0] / length, vec[1] / length, vec[2] / length];
  }

  function addVertex(vec) {
    vertices.push(vec[0], vec[1], vec[2]);
    const length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
    normals.push(vec[0] / length, vec[1] / length, vec[2] / length);

    // Calculate UVs based on the spherical coordinates
    const phi = Math.atan2(vec[2], vec[0]);
    const theta = Math.asin(vec[1] / length);
    uvs.push(1 - (phi + Math.PI) / (2 * Math.PI), (theta + Math.PI / 2) / Math.PI);
  }

  function getMiddlePoint(point1, point2) {
    const middle = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2, (point1[2] + point2[2]) / 2];
    return normalize(middle);
  }

  // Create 12 vertices of an icosahedron
  const t = (1 + Math.sqrt(5)) / 2;
  const verticesData = [
        [-1, t, 0],
        [1, t, 0],
        [-1, -t, 0],
        [1, -t, 0],
        [0, -1, t],
        [0, 1, t],
        [0, -1, -t],
        [0, 1, -t],
        [t, 0, -1],
        [t, 0, 1],
        [-t, 0, -1],
        [-t, 0, 1],
    ];

  // Create the 20 triangles of the icosphere
  const faces = [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1],
    ];

  // Subdivide the triangles to create a more spherical shape
  const middlePointIndexCache = {};
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const a = verticesData[face[0]];
    const b = verticesData[face[1]];
    const c = verticesData[face[2]];

    const p0 = getMiddlePoint(a, b);
    const p1 = getMiddlePoint(b, c);
    const p2 = getMiddlePoint(c, a);

    const points = [a, b, c, p0, p1, p2];
    for (const point of points) {
      const key = point.toString();
      if (!(key in middlePointIndexCache)) {
        addVertex(point);
        middlePointIndexCache[key] = vertices.length / 3 - 1;
      }
    }

    indices.push(
      //face[0],
      middlePointIndexCache[p0.toString()],
      middlePointIndexCache[p2.toString()],
      //face[1],
      middlePointIndexCache[p1.toString()],
      middlePointIndexCache[p0.toString()],
      //face[2],
      middlePointIndexCache[p2.toString()],
      middlePointIndexCache[p1.toString()],
      middlePointIndexCache[p0.toString()],
      middlePointIndexCache[p1.toString()],
      middlePointIndexCache[p2.toString()]
    );
  }
  return { vertices, normals, uvs, indices };
}