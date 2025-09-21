export const skyboxVertex =
  `#version 300 es
	in vec3 position;

  uniform Camera {
    mat4 view;
    mat4 projection;
    vec3 camPosition;
  } camera;
  uniform mat4 model;
	
	out highp vec3 texCoord;
		
	void main(void){
		texCoord = position;
		gl_Position = camera.projection * camera.view * model * vec4(position.xyz, 1.0); 
	}`