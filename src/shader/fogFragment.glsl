#include <math>
#include <common>

in vec2 v_uv;

uniform CameraBlock {
  Camera camera;
};

layout(std140) uniform FogBlock {
  vec4 fogColor;
  vec2 fogParams;
  float height;
  float heightFalloff;
};

uniform sampler2D sceneTexture;
uniform sampler2D depthTexture;

out vec4 fragment_color;

void main() {
  vec4 scene_color = texture(sceneTexture, v_uv);
  float sample_depth = texture(depthTexture, v_uv).r;
  float linear_depth = linearize_depth(sample_depth, camera.near, camera.far);
  float distance_range = max(fogParams.y - fogParams.x, 1e-5);
  float distance_fog = clamp((linear_depth - fogParams.x) / distance_range, 0.0, 1.0);

  vec3 world_position = reconstruct_world_position(camera.view, camera.projection, v_uv, sample_depth);
  float height_falloff = max(heightFalloff, 1e-5);
  float height_inner_bound = height - height_falloff;
  float camera_height_fog = 1.0 - smoothstep(height_inner_bound, height, camera.cam_position.y);
  float fragment_height_fog = 1.0 - smoothstep(height_inner_bound, height, world_position.y);
  float height_fog = max(camera_height_fog, fragment_height_fog);
  float fog_factor = distance_fog * height_fog;

  fragment_color = vec4(mix(scene_color.rgb, fogColor.rgb, fog_factor), scene_color.a);
}
