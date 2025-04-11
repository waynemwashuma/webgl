
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
  
  out vec3 v_position;
  out vec2 v_uv;
  out vec3 v_normal;
  out vec3 camDirection;

  void main(){
    vec3 worldSpacePosition = (model * vec4(position,1.0)).xyz;
    mat3 normalMatrix = mat3(model);
    
    v_position = worldSpacePosition;
    v_uv = uv;
    v_normal = normalMatrix * normal;
    camDirection = worldSpacePosition - camera.camPosition;
    
    gl_Position = camera.projection * camera.view * vec4(worldSpacePosition, 1.0);
  }
`