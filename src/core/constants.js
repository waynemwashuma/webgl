/**
 * @enum {number}
 * Comparison functions for depth, stencil, and sampler tests
 */
export const CompareFunction = /** @type {const} */({
  Never: 0x0200,      // gl.NEVER
  Less: 0x0201,       // gl.LESS
  Equal: 0x0202,      // gl.EQUAL
  Lequal: 0x0203,     // gl.LEQUAL
  Greater: 0x0204,    // gl.GREATER
  NotEqual: 0x0205,   // gl.NOTEQUAL
  Gequal: 0x0206,     // gl.GEQUAL
  Always: 0x0207      // gl.ALWAYS
})