export const skyboxFragment =
  `#version 300 es
  precision mediump float;
	in highp vec3 texCoord;

	uniform samplerCube day;
	uniform samplerCube night;
	uniform float lerp;

	out vec4 final_color;
	void main(void){
	  vec3 direction = normalize(texCoord);
		final_color = mix(texture(day,direction),texture(night,direction),lerp);
	}`