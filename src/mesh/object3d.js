import { Transform3D } from "../math/index.js"

export class Object3D {
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
   * @param {Object3D} child
   */
  add(child){
    child.parent = this
    this.children.push(child)
  }

  /**
   * @param {Object3D} child
   */
  remove(child){
    const index = this.children.indexOf(child)
    if(index === -1) return

    child.parent = undefined
    this.children.splice(index,1)
  }
  /**
   * @param {Traverser} func
   */
  traverseBFS(func){
    /**@type {Object3D[]} */
    const queue = [this]

    for (let i = 0; i < queue.length; i++) {
      const object = queue.shift()
      const visible = func(object)

      if(!visible) continue
      queue.push(...object.children)
    }
  }

  /**
   * @param {Traverser} func
   */
  traverseDFS(func){
    const visible = func(this)

    if(!visible) return
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverseDFS(func);
    }
  }
}

/**
 * @callback Traverser
 * @param {Object3D} object
 * @returns {boolean}
 */