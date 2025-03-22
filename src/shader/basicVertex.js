
export const basicVertex =
  `#version 300 es
  precision mediump float;
  
  uniform camera {
    mat4 view;
    mat4 projection;
    vec3 camPosition;
  };
  
  uniform mat4 model;
  
  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  
  out vec2 v_uv;
  out vec3 v_normal;
  out mat3 invNormalMat;
  out vec3 camDirection;

  void main(){
    gl_Position = projection * view * model * vec4(position,1.0);
    invNormalMat = mat3(model);
    v_uv = uv;
    camDirection =  gl_Position.xyz - camPosition;
    v_normal = normal;
  }
`