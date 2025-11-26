import { Affine3, Color, Vector3 } from '../math/index.js'
import { Object3D } from '../objects/index.js'
import { OrthographicShadow } from './shadow/index.js'

export class DirectionalLight extends Object3D {
  intensity = 1.0
  color = new Color()

  /**
   * @type {OrthographicShadow | undefined}
   */
  shadow

  /**
   */
  pack() {
    const direction = this.transform.world.transformWithoutTranslation(new Vector3(0, 0, -1))

    return [
      ...this.color,
      ...direction,
      this.intensity,
      0,
      0,
      0,
      0
    ]
  }

  /**
   * @override
   */
  update(){
    super.update()
    if(this.shadow instanceof OrthographicShadow){
      const proj = this.shadow.projection.asProjectionMatrix(this.shadow.near, this.shadow.far)
      Affine3.toMatrix4(this.transform.world.clone().invert(), this.shadow.viewMatrix)
      this.shadow.projectionMatrix.copy(proj)
    }
  }
}