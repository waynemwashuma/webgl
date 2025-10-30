import { Affine3, Matrix4, Transform3D } from "../../math/index.js"
import { Object3D } from "../object3d.js"
import { RenderTarget } from "../../rendertarget/index.js"
import { PerspectiveProjection, Projection } from "./projection.js"

export class Camera extends Object3D {
	near = 0.1
	
	far = 2000

	/**
	 * @type {RenderTarget | undefined}
	 */
	target
	/**
	 * @type {Projection}
	 */
	projection = new PerspectiveProjection()
	view = new Matrix4()
	
	/**
	 * @override
	 * @param {Transform3D} [parent]
	 */
	update(parent) {
		super.update(parent)
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