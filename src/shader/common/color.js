export const colorShaderLib = `
  vec3 quick_sRGB_to_linear(vec3 color) {
    return pow(color, vec3(2.2));
  }
  
  vec3 quick_linear_to_sRGB(vec3 color) {
    return pow(color, 1.0 / vec3(2.2));
  }
`