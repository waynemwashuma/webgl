export const basicVertex =
  `
  precision mediump float;
  
  uniform Camera {
    mat4 view;
    mat4 projection;
    vec3 cam_position;
  } camera;
  uniform mat4 model;
  
  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  
  out vec3 v_position;
  out vec2 v_uv;
  out vec3 v_normal;
  out vec3 cam_direction;

  void main(){
    vec3 world_space_position = (model * vec4(position,1.0)).xyz;
    mat3 normal_matrix = mat3(model);
    
    v_position = world_space_position;
    v_uv = uv;
    v_normal = normal_matrix * normal;
    cam_direction = camera.cam_position - world_space_position;
    
    gl_Position = camera.projection * camera.view * vec4(world_space_position, 1.0);
  }
`