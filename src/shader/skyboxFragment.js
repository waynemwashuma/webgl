export const skyboxFragment =
  `
  precision mediump float;

	#include <common>

	struct SkyBoxMaterial {
    float lerp;
  };

	in highp vec3 v_uv;

	out vec4 fragment_color;
	
	uniform SkyBoxMaterialBlock {
    SkyBoxMaterial material;
  };
	uniform samplerCube day;
	uniform samplerCube night;

	void main(){
	  vec3 direction = normalize(v_uv);
		
		fragment_color = mix(texture(day,direction),texture(night,direction),material.lerp);
	}`