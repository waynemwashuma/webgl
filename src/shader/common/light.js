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

  struct PointLight {
    vec4 color;
    vec3 position;
    float intensity;
    float radius;
    float decay;
  };

  struct DirectionalLights {
    int count;
    DirectionalLight lights[MAX_DIRECTIONAL_LIGHTS];
  };

  struct PointLights {
    int count;
    PointLight lights[MAX_POINT_LIGHTS];
  };

  float calculate_brightness(vec3 normal, vec3 dir) {
    return max(dot(normal, dir), 0.0);
  }

  // https://lisyarus.github.io/blog/posts/point-light-attenuation.html
  float attenuate_point_light(float distance, float radius, float max_intensity, float falloff){
    float s = distance / radius;

    if (s >= 1.0){
      return 0.0;
    }

    float s2 = sq(s);
    return max_intensity * sq(1.0 - s2) / (1.0 + falloff * s2);
  }
`