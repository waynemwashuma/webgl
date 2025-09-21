
export const basicVertex =
  `#version 300 es
  precision mediump float;
  
  uniform Camera {
    mat4 view;
    mat4 projection;
    vec3 camPosition;
  } camera;
  uniform mat4 model;
  
  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  
  out vec2 v_uv;
  out vec3 v_normal;
  out vec3 camDirection;

  void main(){
    mat3 normalMatrix = mat3(model);
    gl_Position = camera.projection * camera.view * model * vec4(position,1.0);
    v_uv = uv;
    camDirection = gl_Position.xyz - camera.camPosition;
    v_normal = normalMatrix * normal;
  }
`