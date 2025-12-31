/** @import { WebGLRenderer } from "./renderer.js" */
import { WebGLRenderDevice } from "../core/index.js";
import { Object3D } from "../objects/object3d.js";
import { abstractClass, abstractMethod } from "../utils/index.js";
import { RenderItem } from "./core/index.js";

/**
 * @abstract
 */
export class Plugin {
  constructor() {
    abstractClass(this, Plugin)
  }

  /**
   * @param {WebGLRenderer} _renderer
   */
  init( _renderer){
    abstractMethod(this, Plugin, Plugin.prototype.init.name)
  }

  /**
   * @param {Object3D[]} _objects
   * @param {WebGLRenderDevice} _device
   * @param {WebGLRenderer} _renderer
   */
  preprocess(_objects, _device, _renderer) {
    abstractMethod(this, Plugin, Plugin.prototype.preprocess.name)
  }

  /**
   * @param {Object3D} _object
   * @param {WebGLRenderDevice} _device
   * @param {WebGLRenderer} _renderer
   * @returns {RenderItem | undefined}
   */
  getRenderItem(_object, _device, _renderer){
    return
  }
}