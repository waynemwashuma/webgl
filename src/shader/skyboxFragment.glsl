#include <common>

in vec2 v_uv;

uniform CameraBlock {
  Camera camera;
};

uniform SkyBoxBlock {
  mat4 model;
  float lerp;
};
uniform samplerCube day;
uniform samplerCube night;

out vec4 fragment_color;

vec3 getSkyboxDirection() {
  vec2 ndc = v_uv * 2.0 - 1.0;
  vec4 clip = vec4(ndc, 1.0, 1.0);
  vec4 viewRay = inverse(camera.projection) * clip;
  vec3 viewDirection = normalize(viewRay.xyz / viewRay.w);
  vec3 worldDirection = normalize((inverse(camera.view) * vec4(viewDirection, 0.0)).xyz);

  return normalize((inverse(model) * vec4(worldDirection, 0.0)).xyz);
}

void main() {
  vec3 direction = getSkyboxDirection();
  fragment_color = mix(texture(day, direction), texture(night, direction), lerp);
}
