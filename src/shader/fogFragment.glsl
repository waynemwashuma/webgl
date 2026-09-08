in vec2 v_uv;

out vec4 fragment_color;

uniform sampler2D sceneTexture;
uniform sampler2D depthTexture;

layout(std140) uniform FogBlock {
  vec4 fogColor;
  vec4 fogParams;
};

float linearize_depth(float depth, float near, float far){
  float ndc = depth * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - ndc * (far - near));
}

void main() {
  vec4 scene_color = texture(sceneTexture, v_uv);
  float sample_depth = texture(depthTexture, v_uv).r;
  float linear_depth = linearize_depth(sample_depth, fogParams.z, fogParams.w);
  float fog_range = max(fogParams.y - fogParams.x, 1e-5);
  float fog_factor = clamp((linear_depth - fogParams.x) / fog_range, 0.0, 1.0);

  fragment_color = vec4(mix(scene_color.rgb, fogColor.rgb, fog_factor), scene_color.a);
}
