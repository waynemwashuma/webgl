struct Camera {
  mat4 view;
  mat4 projection;
  vec3 cam_position;
  float near;
  float far;
};

// functions
vec3 tint(vec3 tex_color, vec3 tint_color){
  return tex_color * tint_color;
}

vec2 octahedral_encode(vec3 normal) {
  normal /= abs(normal.x) + abs(normal.y) + abs(normal.z);

  vec2 encoded = normal.xy;

  if (normal.z < 0.0) {
    encoded = (1.0 - abs(encoded.yx)) * sign(encoded.xy);
  }

  return encoded;
}

vec3 octahedral_decode(vec2 encoded) {
  vec3 normal = vec3(encoded.xy, 1.0 - abs(encoded.x) - abs(encoded.y));

  if (normal.z < 0.0) {
    normal.xy = (1.0 - abs(normal.yx)) * sign(normal.xy);
  }

  return normalize(normal);
}

vec3 reconstruct_world_position(mat4 view, mat4 projection, vec2 uv, float depth) {
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clip = vec4(ndc, depth * 2.0 - 1.0, 1.0);
  vec4 view_position = inverse(projection) * clip;
  view_position /= view_position.w;
  return (inverse(view) * vec4(view_position.xyz, 1.0)).xyz;
}

ivec2 map_to_index_2d(uint index, uint width) {
  return ivec2(int(index % width), int(index / width));
}

mat4 get_value_from_texture(uint index, sampler2D transforms) {
  uint size = uint(textureSize( transforms, 0 ).x);
  uint stride = index * uint(4);
  ivec2 coord0 = map_to_index_2d(stride, size);
  ivec2 coord1 = map_to_index_2d(stride + uint(1), size);
  ivec2 coord2 = map_to_index_2d(stride + uint(2), size);
  ivec2 coord3 = map_to_index_2d(stride + uint(3), size);
  vec4 column1 = texelFetch( transforms, coord0, 0 );
  vec4 column2 = texelFetch( transforms, coord1, 0 );
  vec4 column3 = texelFetch( transforms, coord2, 0 );
  vec4 column4 = texelFetch( transforms, coord3, 0 );

  return mat4( column1, column2, column3, column4 );
}

ivec3 map_to_index_3d(uint index, uvec3 size) {
  uint depthMax = size.x * size.y;
  uint rem = index % depthMax;
  uint z = index / depthMax;
  ivec2 xy = map_to_index_2d(rem, size.x);
  return ivec3(xy, int(z));
}

mat4 get_value_from_texture(uint index, sampler2DArray transforms) {
  uvec3 size = uvec3(textureSize(transforms, 0));
  uint stride = index * uint(4);
  ivec3 coord0 = map_to_index_3d(stride, size);
  ivec3 coord1 = map_to_index_3d(stride + uint(1), size);
  ivec3 coord2 = map_to_index_3d(stride + uint(2), size);
  ivec3 coord3 = map_to_index_3d(stride + uint(3), size);
  vec4 column1 = texelFetch(transforms, coord0, 0);
  vec4 column2 = texelFetch(transforms, coord1, 0);
  vec4 column3 = texelFetch(transforms, coord2, 0);
  vec4 column4 = texelFetch(transforms, coord3, 0);

  return mat4( column1, column2, column3, column4 );
}
