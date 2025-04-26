export const commonShaderLib = `
  // structs
  struct Camera {
    mat4 view;
    mat4 projection;
    vec3 cam_position;
  };
  
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
  
  // functions
  float calculate_brightness(vec3 normal, vec3 dir) {
    return max(dot(normal, dir), 0.0);
  }

  vec3 tint(vec3 tex_color, vec3 tint_color){
    return tex_color * tint_color;
  }
`