import { Transform3D } from "../math/index.js"

export class Object3D {
  /**
   * @type {string}
   */
  name = ''
  transform = new Transform3D()

  /**
   * @type {Object3D | undefined}
   */
  parent
  /**
   * @type {Object3D[]}
   */
  children = []

  /**
   * @param {Transform3D} [parent]
   */
  update(parent) {
    this.transform.updateMatrix(parent)

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(this.transform)
    }
  }

  /**
   * @param {Object3D[]} children
   */
  add(...children) {
    this.children.push(...children)
    children.forEach(child => child.parent = this)
  }

  /**
   * @param {Object3D[]} children
   */
  remove(...children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      const index = this.children.indexOf(child)
      if (index === -1) return
  
      child.parent = undefined
      this.children.splice(index, 1)
    }
  }
  /**
   * @param {Traverser} func
   */
  traverseBFS(func) {
    /**@type {Object3D[]} */
    const queue = [this]

    for (let i = 0; i < queue.length; i++) {
      const object = queue.shift()
      const visible = func(object)

      if (!visible) continue
      queue.push(...object.children)
    }
  }

  /**
   * @param {Traverser} func
   */
  traverseDFS(func) {
    const visible = func(this)

    if (!visible) return
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverseDFS(func);
    }
  }

  /**
   * @param {this} object
   */
  copy(object){
    this.transform.copy(object.transform)

    this.add(...object.children.map(child=>child.clone()))

    return this
  }

  clone() {
    return new /**@type {new (...arg:any) => this}*/(this.constructor)().copy(this)
  }
}

/**
 * @callback Traverser
 * @param {Object3D} object
 * @returns {boolean}
 */