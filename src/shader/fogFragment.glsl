#include <math>
#include <common>

in vec2 v_uv;

uniform CameraBlock {
  Camera camera;
};

layout(std140) uniform FogBlock {
  vec4 fogColor;
  vec4 fogParams;
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
  float fog_start = fogParams.x;
  float fog_end = fogParams.y;
  float fog_density = max(fogParams.z, 0.0);
  int fog_type = int(fogParams.w);
  float distance_fog = 0.0;

  switch (fog_type) {
    case 1: {
      distance_fog = clamp(1.0 - exp(-fog_density * linear_depth), 0.0, 1.0);
      break;
    }
    default: {
      float distance_range = max(fog_end - fog_start, 1e-5);
      distance_fog = clamp((linear_depth - fog_start) / distance_range, 0.0, 1.0);
      break;
    }
  }

  vec3 world_position = reconstruct_world_position(camera.view, camera.projection, v_uv, sample_depth);
  float height_falloff = max(heightFalloff, 1e-5);
  float height_inner_bound = height - height_falloff;
  float camera_height_fog = 1.0 - smoothstep(height_inner_bound, height, camera.cam_position.y);
  float fragment_height_fog = 1.0 - smoothstep(height_inner_bound, height, world_position.y);
  float height_fog = max(camera_height_fog, fragment_height_fog);
  float fog_factor = distance_fog * height_fog;

  fragment_color = vec4(mix(scene_color.rgb, fogColor.rgb, fog_factor), scene_color.a);
}
