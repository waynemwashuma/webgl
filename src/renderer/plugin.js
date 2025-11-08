/** @import { WebGLRenderer } from "./renderer.js" */
import { Object3D } from "../objects/object3d.js";
import { abstractClass, abstractMethod } from "../utils/index.js";

/**
 * @abstract
 */
export class Plugin {
  constructor() {
    abstractClass(this, Plugin)
  }

  /**
   * @param {WebGL2RenderingContext} _context
   * @param {WebGLRenderer} _renderer
   */
  init(_context, _renderer){
    abstractMethod(this, Plugin, Plugin.prototype.init.name)
  }

  /**
   * @param {Object3D[]} _objects
   * @param {WebGL2RenderingContext} _context
   * @param {WebGLRenderer} _renderer
   */
  preprocess(_objects, _context, _renderer) {
    abstractMethod(this, Plugin, Plugin.prototype.preprocess.name)
  }

  /**
   * @param {Object3D} _object
   * @param {WebGL2RenderingContext} _context
   * @param {WebGLRenderer} _renderer
   */
  renderObject3D(_object, _context, _renderer) {
    abstractMethod(this, Plugin, Plugin.prototype.renderObject3D.name)
  }
}