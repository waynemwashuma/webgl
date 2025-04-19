import { Geometry } from "./geometry.js"
import { AttributeData } from "../core/index.js"

export class CylinderGeometry extends Geometry {
  constructor(radius = 1, height = 1, numSegments = 15) {
    super()
    const { indices, vertices, normals, uvs } = createCylinder(radius, height, numSegments);

    this.indices = new Uint16Array(indices)
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


function createCylinder(radius, height, numSegments) {
  let offset = 0
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const angleIncrement = (2 * Math.PI) / numSegments;
  const halfHeight = height / 2
  for (let i = 0; i <= (2 * Math.PI); i += angleIncrement) {
    let cos = Math.cos(i)
    let sin = Math.sin(i)
    vertices.push(
      radius * cos,
      radius * sin,
      halfHeight,
      radius * cos,
      radius * sin,
      -halfHeight
    )
    normals.push(
      cos, sin, 0,
      cos, sin, 0
    )
    uvs.push(
      i / (Math.PI * 2), 0,
      i / (Math.PI * 2), 1,
    )

    //uvs.push(0,0,0,1,1,0,1,1)
  }

  for (let i = 0; i < vertices.length / 3; i += 3) {
    if (i + 3 >= vertices.length / 3) break
    indices.push(
      i + 2, i, i + 1,
      i + 2, i + 1, i + 3
    )
    i--
  }

  //top part
  offset = vertices.length / 3
  vertices.push(0, 0, halfHeight)
  uvs.push(0.5, 0.5)
  normals.push(0, 0, 1)
  for (let i = 0; i <= (2 * Math.PI); i += angleIncrement) {
    let cos = Math.cos(i)
    let sin = Math.sin(i)
    vertices.push(
      radius * cos,
      radius * sin,
      halfHeight
    )
    normals.push(
      0, 0, 1
    )
    uvs.push(
      (cos + 1) * 0.5, (sin + 1) * 0.5,
    )
  }
  for (let i = offset + 2; i < vertices.length / 3; i++) {
    indices.push(i - 1, i, offset)
  }


  //bottom part
  offset = vertices.length / 3
  vertices.push(0, 0, -halfHeight)
  uvs.push(0.5, 0.5)
  normals.push(0, 0, -1)
  for (let i = (2 * Math.PI); i >= 0; i -= angleIncrement) {
    let cos = Math.cos(i)
    let sin = Math.sin(i)
    vertices.push(
      radius * cos,
      radius * sin,
      -halfHeight
    )
    normals.push(
      0, 0, -1
    )
    uvs.push(
      (cos + 1) * 0.5,
      (sin + 1) * 0.5,
    )
  }
  for (let i = offset + 2; i < vertices.length / 3; i++) {
    indices.push(i - 1, i, offset)
  }

  return { vertices, normals, uvs, indices };
}

function createCircle(radius, angleIncrement, vertices, normals, uvs) {

}