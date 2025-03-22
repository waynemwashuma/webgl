import { Matrix4, Transform3D } from "./math/index.js"

export class Camera {
  transform = new Transform3D()
  projection = new Matrix4()
  view = new Matrix4()
  constructor() {
    //this.updateProjection()
  }
  updateMatrix() {
    this.transform.matrix.identity()
      .translate(this.transform.position)
      .rotateX(this.transform.orientation.x)
      .rotateY(this.transform.orientation.y)
      .rotateZ(this.transform.orientation.z)
    
    this.view.copy(this.transform.matrix).inverse()
  }
  updateProjection(width = 2, height = 2, near = -1000, far = 1000) {
    this.projection.makeOthorgraphic(-width / 2, width / 2, -height / 2, height / 2, near, far)
  }
  makePerspective(fov = 45, near = 0.1, far = 1000) {
    this.projection.makePerspective(fov, innerWidth / innerHeight, near, far)
  }
  
  getLayout() {
    return {
      name: "camera",
      size: 144
    }
  }
  getData() {
    return {
      name: "camera",
      data: new Float32Array([
        ...this.view,
        ...this.projection,
        ...this.transform.position
      ]).buffer
    }
  }
}