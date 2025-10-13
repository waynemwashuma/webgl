export class WebGLExtensions {
  /**
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    this.gl = gl;
    this.supported = gl.getSupportedExtensions() || [];
    this.cache = new Map();
  }

  /**
   * Check if an extension is supported.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    return this.supported.includes(name);
  }

  /**
   * Get (and cache) an extension object.
   * @param {string} name
   * @returns {object | undefined}
   */
  get(name) {
    if (this.cache.has(name))
      return this.cache.get(name);

    const ext = this.has(name) ? this.gl.getExtension(name) : undefined;
    this.cache.set(name, ext);
    return ext;
  }

  /**
   * Initialize all supported extensions at once
   */
  initAll() {
    for (const name of this.supported) {
      this.get(name);
    }
  }
}
