export const commonShaderLib = `
  // structs
  struct DirectionalLight {
    vec4 color;
    vec3 direction;
    float intensity;
  };

  // functions
  float calculate_brightness(vec3 normal, vec3 dir) {
    return max(dot(normal, dir), 0.0);
  }
`