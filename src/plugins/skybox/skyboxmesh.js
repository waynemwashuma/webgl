import { CuboidMeshBuilder } from "../../mesh/index.js";

export class SkyBoxMesh {
  cube

  constructor() {
    const cuboid = new CuboidMeshBuilder()
    cuboid.width = 1
    cuboid.height = 1
    cuboid.depth = 1

    this.cube = cuboid.build()
  }
}
