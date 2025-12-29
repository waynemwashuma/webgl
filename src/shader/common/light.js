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
    int shadow_index;
  };

  struct SpotLight {
    vec4 color;
    vec3 position;
    int shadow_index;
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
    float layer;
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

  vec3 map_cube_from_array_texture_ndc(vec3 direction) {
    vec3 absolute_direction = abs(direction);

    if (absolute_direction.x >= absolute_direction.y && absolute_direction.x >= absolute_direction.z) {
      float face = direction.x > 0.0 ? 0.0 : 1.0;
      float inv = 1.0 / absolute_direction.x;
      vec2 uv = vec2(
        direction.x > 0.0 ? -direction.z : direction.z,
        -direction.y
      );
      
      return vec3(uv * inv, face);
    } else if (absolute_direction.y >= absolute_direction.x && absolute_direction.y >= absolute_direction.z) {
      float face = direction.y > 0.0 ? 2.0 : 3.0;
      float inv = 1.0 / absolute_direction.y;
      vec2 uv = vec2(
        direction.x,
        direction.y > 0.0 ? direction.z : -direction.z
      );

      return vec3(uv * inv, face);
    }
    
    float face = direction.z > 0.0 ? 4.0 : 5.0;
    float inv = 1.0 / absolute_direction.z;
    vec2 uv = vec2(
      direction.z > 0.0 ? direction.x : -direction.x,
      -direction.y
    );
      
    return vec3(uv * inv, face);
  }

  float shadow_contribution_2d(Shadow shadow, sampler2DArray shadow_atlas, vec3 position, float NdotL){
    vec4 clipped_position = shadow.space * vec4(position, 1.0);
    vec3 ndc_position = clipped_position.xyz / clipped_position.w;
    vec3 shadow_map_postion = ndc_position * 0.5 + 0.5;

    if(
      shadow_map_postion.x < 0.0 || shadow_map_postion.x > 1.0 ||
      shadow_map_postion.y < 0.0 || shadow_map_postion.y > 1.0
    ){
      return 1.0;
    }
    float shadow_map_depth = texture(
      shadow_atlas,
      vec3(shadow_map_postion.xy, shadow.layer)
    ).r;
    float current_depth = shadow_map_postion.z;
    float normal_bias = shadow.normal_bias * (1.0 - NdotL);
    float bias = shadow.bias + normal_bias;

    return current_depth - bias > shadow_map_depth ? 0.0 : 1.0;
  }
  
  float shadow_contribution_cube(Shadow shadow, sampler2DArray shadow_atlas, vec3 position, float NdotL){
    // the clipping planes are encoded in the first column of the space matrix
    vec2 clip_planes = shadow.space[0].xy;
    vec3 light_position = shadow.space[3].xyz;
    vec3 direction = position - light_position;
    float distance = length(direction);
    vec3 norm_distance = direction / distance;
    float near = clip_planes.x;
    float far = clip_planes.y;
    
    vec3 ndc_uv = map_cube_from_array_texture_ndc(direction);
    vec2 shadow_uv = ndc_uv.xy * 0.5 + 0.5;
    float shadow_map_depth = texture(
      shadow_atlas,
      vec3(shadow_uv.xy, shadow.layer + ndc_uv.z)
    ).r;
    float scale = max(abs(norm_distance.x),max(abs(norm_distance.y), abs(norm_distance.z))); 
    float view_space_map_depth = linearize_depth(shadow_map_depth, near, far);
    float map_depth = view_space_map_depth / (scale * far);
    float current_depth = distance / far;
    
    float normal_bias = shadow.normal_bias * (1.0 - NdotL);
    float bias = shadow.bias + normal_bias;

    return current_depth - bias > map_depth ? 0.0 : 1.0;
  }
`