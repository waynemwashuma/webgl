export const skyboxFragment =
  `
  precision mediump float;

	#include <common>
	
	in highp vec3 v_uv;

	uniform samplerCube day;
	uniform samplerCube night;
	uniform float lerp;

	out vec4 final_color;
	void main(){
	  vec3 direction = normalize(v_uv);
		final_color = mix(texture(day,direction),texture(night,direction),lerp);
	}`