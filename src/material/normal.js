import { Material } from "./material.js"
import { basicVertex, normalFragment} from "../shader/index.js"

export class NormalMaterial extends Material {

  constructor() {
    super()
  }

  /**
   * @override
   */
  vertex() {
    return basicVertex
  }

  /**
   * @override
   */
  fragment() {
    return normalFragment
  }

  /**
   * @override
   */
  getData() {    
    return new Float32Array([]).buffer
  }
}
