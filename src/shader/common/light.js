export const lightShaderLib = `
  struct DirectionalLight {
    vec4 color;
    vec3 direction;
    float intensity;
    int shadow_index;
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

  struct SpotLight {
    vec4 color;
    vec3 position;
    vec3 direction;
    float intensity;
    float distance;
    float decay;
    float innerAngle;
    float outerAngle;
  };

  struct Shadow {
    mat4 space;
    float bias;
    float normal_bias;
  };

  struct DirectionalLights {
    int count;
    DirectionalLight lights[MAX_DIRECTIONAL_LIGHTS];
  };

  struct PointLights {
    int count;
    PointLight lights[MAX_POINT_LIGHTS];
  };

  struct SpotLights {
    int count;
    SpotLight lights[MAX_SPOT_LIGHTS];
  };

  float calculate_brightness(vec3 normal, vec3 dir) {
    return max(dot(normal, dir), 0.0);
  }

  // https://lisyarus.github.io/blog/posts/point-light-attenuation.html
  float attenuate_light_distance(float distance, float max_distance, float falloff){
    float s = distance / max_distance;

    if (s >= 1.0){
      return 0.0;
    }

    float s2 = sq(s);
    return sq(1.0 - s2) / (1.0 + falloff * s2);
  }
  
  float attenuate_point_light(float distance, float radius, float max_intensity, float falloff){
    float s = distance / radius;

    if (s >= 1.0){
      return 0.0;
    }

    float s2 = sq(s);
    return max_intensity * sq(1.0 - s2) / (1.0 + falloff * s2);
  }

  float attenuate_spot_light(SpotLight light, vec3 direction, float distance){
    float factor = max(dot(light.direction, -direction), 0.0);
    
    if(factor > light.outerAngle){
    float cone_attenuation = smoothstep(light.outerAngle, light.innerAngle, factor);
    float distance_attenuation = attenuate_light_distance(distance, light.distance, light.decay);
      return cone_attenuation * distance_attenuation * light.intensity;
    }
    return 0.0;
  }

  float shadow_contribution_2d(Shadow shadow, sampler2D shadow_atlas, vec3 position, float NdotL){
    vec4 clipped_position = shadow.space * vec4(position, 1.0);
    vec3 ndc_position = clipped_position.xyz / clipped_position.w;
    vec3 shadow_map_postion = ndc_position * 0.5 + 0.5;

    if(
      shadow_map_postion.x < 0.0 || shadow_map_postion.x > 1.0 ||
      shadow_map_postion.y < 0.0 || shadow_map_postion.y > 1.0
    ){
      return 1.0;
    }
    float shadow_map_depth = texture(shadow_atlas, shadow_map_postion.xy).r;
    float current_depth = shadow_map_postion.z;
    float normal_bias = shadow.normal_bias * (1.0 - NdotL);
    float bias = shadow.bias + normal_bias;

    return current_depth - bias > shadow_map_depth ? 0.0 : 1.0;
  }
`