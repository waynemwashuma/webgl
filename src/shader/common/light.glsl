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
  uint mode;
  float pcf_radius;
  float pcss_search_radius;
  float pcss_penumbra;
  float _padding2;
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

vec3 map_cube_to_array_texture_direction(float face, vec2 uv) {
  if (face == 0.0) {
    return normalize(vec3(1.0, -uv.y, -uv.x));
  }

  if (face == 1.0) {
    return normalize(vec3(-1.0, -uv.y, uv.x));
  }

  if (face == 2.0) {
    return normalize(vec3(uv.x, 1.0, uv.y));
  }

  if (face == 3.0) {
    return normalize(vec3(uv.x, -1.0, -uv.y));
  }

  if (face == 4.0) {
    return normalize(vec3(uv.x, -uv.y, 1.0));
  }

  return normalize(vec3(-uv.x, -uv.y, -1.0));
}

float shadow_compare_2d(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 shadow_map_postion,
  float current_depth,
  float bias
){
  float shadow_map_depth = texture(
    shadow_atlas,
    vec3(shadow_map_postion.xy, shadow.layer)
  ).r;

  return current_depth - bias > shadow_map_depth ? 0.0 : 1.0;
}

float shadow_compare_cube(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 direction,
  float current_depth,
  float bias
){
  vec3 ndc_uv = map_cube_from_array_texture_ndc(direction);
  vec2 shadow_uv = ndc_uv.xy * 0.5 + 0.5;
  float shadow_map_depth = texture(
    shadow_atlas,
    vec3(shadow_uv.xy, shadow.layer + ndc_uv.z)
  ).r;
  vec2 clip_planes = shadow.space[0].xy;
  float near = clip_planes.x;
  float far = clip_planes.y;
  vec3 norm_direction = normalize(direction);
  float scale = max(abs(norm_direction.x), max(abs(norm_direction.y), abs(norm_direction.z)));
  float view_space_map_depth = linearize_depth(shadow_map_depth, near, far);
  float map_depth = view_space_map_depth / (scale * far);

  return current_depth - bias > map_depth ? 0.0 : 1.0;
}

float shadow_pcf_2d_radius(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 shadow_map_postion,
  float current_depth,
  float radius,
  float bias
){
  vec2 texel_size = 1.0 / vec2(textureSize(shadow_atlas, 0).xy);
  vec2 pcf_step = texel_size * radius;
  float shadow_sum = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 sample_offset = vec2(float(x), float(y)) * pcf_step;
      vec3 sample_position = vec3(shadow_map_postion.xy + sample_offset, shadow_map_postion.z);
      shadow_sum += shadow_compare_2d(shadow, shadow_atlas, sample_position, current_depth, bias);
    }
  }

  return shadow_sum / 9.0;
}

float shadow_pcf_2d(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 shadow_map_postion,
  float current_depth,
  float bias
){
  return shadow_pcf_2d_radius(
    shadow,
    shadow_atlas,
    shadow_map_postion,
    current_depth,
    shadow.pcf_radius,
    bias
  );
}

float shadow_pcf_cube_radius(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 direction,
  float current_depth,
  float radius,
  float bias
){
  vec3 ndc_uv = map_cube_from_array_texture_ndc(direction);
  vec2 texel_size = 1.0 / vec2(textureSize(shadow_atlas, 0).xy);
  vec2 pcf_step = texel_size * radius;
  float shadow_sum = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 sample_offset = vec2(float(x), float(y)) * pcf_step;
      vec2 sample_uv = ndc_uv.xy + sample_offset;
      vec3 sample_direction = map_cube_to_array_texture_direction(ndc_uv.z, sample_uv);
      shadow_sum += shadow_compare_cube(shadow, shadow_atlas, sample_direction, current_depth, bias);
    }
  }

  return shadow_sum / 9.0;
}

float shadow_pcf_cube(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 direction,
  float current_depth,
  float bias
){
  return shadow_pcf_cube_radius(
    shadow,
    shadow_atlas,
    direction,
    current_depth,
    shadow.pcf_radius,
    bias
  );
}

float shadow_pcss_2d(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 shadow_map_postion,
  float current_depth,
  float bias
){
  vec2 texel_size = 1.0 / vec2(textureSize(shadow_atlas, 0).xy);
  vec2 search_step = texel_size * shadow.pcss_search_radius;
  float blocker_sum = 0.0;
  float blocker_count = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 sample_offset = vec2(float(x), float(y)) * search_step;
      float sample_depth = texture(
        shadow_atlas,
        vec3(shadow_map_postion.xy + sample_offset, shadow.layer)
      ).r;
      if (sample_depth < current_depth - bias) {
        blocker_sum += sample_depth;
        blocker_count += 1.0;
      }
    }
  }

  if (blocker_count == 0.0) {
    return 1.0;
  }

  float blocker_depth = blocker_sum / blocker_count;
  float penumbra = (current_depth - blocker_depth) / max(blocker_depth, 0.0001);
  float filter_radius = clamp(
    shadow.pcf_radius + penumbra * shadow.pcss_penumbra,
    shadow.pcf_radius,
    shadow.pcf_radius + 12.0
  );
  return shadow_pcf_2d_radius(
    shadow,
    shadow_atlas,
    shadow_map_postion,
    current_depth,
    filter_radius,
    bias
  );
}

float shadow_pcss_cube(
  Shadow shadow,
  sampler2DArray shadow_atlas,
  vec3 direction,
  float current_depth,
  float bias
){
  vec3 ndc_uv = map_cube_from_array_texture_ndc(direction);
  vec2 texel_size = 1.0 / vec2(textureSize(shadow_atlas, 0).xy);
  vec2 search_step = texel_size * shadow.pcss_search_radius;
  vec2 clip_planes = shadow.space[0].xy;
  float near = clip_planes.x;
  float far = clip_planes.y;
  float blocker_sum = 0.0;
  float blocker_count = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 sample_offset = vec2(float(x), float(y)) * search_step;
      vec2 sample_uv = ndc_uv.xy + sample_offset;
      vec3 sample_direction = map_cube_to_array_texture_direction(ndc_uv.z, sample_uv);
      vec3 sample_ndc = map_cube_from_array_texture_ndc(sample_direction);
      vec2 sample_shadow_uv = sample_ndc.xy * 0.5 + 0.5;
      float shadow_map_depth = texture(
        shadow_atlas,
        vec3(sample_shadow_uv.xy, shadow.layer + sample_ndc.z)
      ).r;
      vec3 norm_direction = normalize(sample_direction);
      float scale = max(abs(norm_direction.x), max(abs(norm_direction.y), abs(norm_direction.z)));
      float view_space_map_depth = linearize_depth(shadow_map_depth, near, far);
      float map_depth = view_space_map_depth / (scale * far);
      if (map_depth < current_depth - bias) {
        blocker_sum += map_depth;
        blocker_count += 1.0;
      }
    }
  }

  if (blocker_count == 0.0) {
    return 1.0;
  }

  float blocker_depth = blocker_sum / blocker_count;
  float penumbra = (current_depth - blocker_depth) / max(blocker_depth, 0.0001);
  float filter_radius = clamp(
    shadow.pcf_radius + penumbra * shadow.pcss_penumbra,
    shadow.pcf_radius,
    shadow.pcf_radius + 12.0
  );
  return shadow_pcf_cube_radius(
    shadow,
    shadow_atlas,
    direction,
    current_depth,
    filter_radius,
    bias
  );
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
  float current_depth = shadow_map_postion.z;
  float normal_bias = shadow.normal_bias * (1.0 - NdotL);
  float bias = shadow.bias + normal_bias;

  if (shadow.mode == 0u) {
    return shadow_compare_2d(shadow, shadow_atlas, shadow_map_postion, current_depth, bias);
  }
  if (shadow.mode == 1u) {
    return shadow_pcf_2d(shadow, shadow_atlas, shadow_map_postion, current_depth, bias);
  }
  if (shadow.mode == 2u) {
    return shadow_pcss_2d(shadow, shadow_atlas, shadow_map_postion, current_depth, bias);
  }
  return shadow_pcf_2d(shadow, shadow_atlas, shadow_map_postion, current_depth, bias);
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
  float current_depth = distance / far;
  
  vec3 ndc_uv = map_cube_from_array_texture_ndc(direction);
  vec2 shadow_uv = ndc_uv.xy * 0.5 + 0.5;
  
  float normal_bias = shadow.normal_bias * (1.0 - NdotL);
  float bias = shadow.bias + normal_bias;

  if (shadow.mode == 0u) {
    return shadow_compare_cube(shadow, shadow_atlas, direction, current_depth, bias);
  }
  if (shadow.mode == 1u) {
    return shadow_pcf_cube(shadow, shadow_atlas, direction, current_depth, bias);
  }
  if (shadow.mode == 2u) {
    return shadow_pcss_cube(shadow, shadow_atlas, direction, current_depth, bias);
  }
  return shadow_pcf_cube(shadow, shadow_atlas, direction, current_depth, bias);
}
