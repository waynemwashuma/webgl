export const skyboxVertex =
  `
  precision mediump float;

	#include <common>

	in vec3 position;

  uniform CameraBlock {
    Camera camera;
  };
  uniform mat4 model;
	
	out highp vec3 v_uv;
		
	void main(){
		v_uv = position;
		gl_Position = camera.projection * camera.view * model * vec4(position.xyz, 1.0); 
	}`