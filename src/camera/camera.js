import { Affine3, Color, Matrix4, Transform3D } from "../math/index.js"
import { Object3D } from "../objects/index.js"
import { PerspectiveProjection, Projection } from "./projection.js"

/**
 * @template T
 */
export class ClearParams {
	enabled = true
	value
	constructor(value){
		this.value = value
	}
}
export class Camera extends Object3D {
	clearColor = new ClearParams(new Color(0, 0, 0, 0))
	clearDepth = new ClearParams(1)
	clearStencil = new ClearParams(0)
	transform = new Transform3D()
	
	near = 0.1
	
	far = 2000
	/**
	 * @type {Projection}
	 */
	projection = new PerspectiveProjection()
	view = new Matrix4()
	
	update() {
		this.transform.updateMatrix()
		const inverseTransform = Affine3.toMatrix4(
			Affine3.invert(this.transform.world)
		)
		this.view.copy(inverseTransform)
	}
	
	getData() {
		const { near, far } = this
		return {
			name: "CameraBlock",
			data: new Float32Array([
				...this.view,
				...this.projection.asProjectionMatrix(near, far),
				...this.transform.position
			]).buffer
		}
	}
}