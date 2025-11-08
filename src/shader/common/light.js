export const lightShaderLib = `
  struct DirectionalLight {
    vec4 color;
    vec3 direction;
    float intensity;
  };

  struct AmbientLight {
    float intensity;
    vec4 color;
  };

  struct DirectionalLights {
    int count;
    DirectionalLight lights[MAX_DIRECTIONAL_LIGHTS];
  };

  float calculate_brightness(vec3 normal, vec3 dir) {
    return max(dot(normal, dir), 0.0);
  }
`