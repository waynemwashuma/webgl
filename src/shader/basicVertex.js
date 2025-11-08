export const basicVertex =
  `
  precision mediump float;
  
  #include <common>
  
  uniform CameraBlock {
    Camera camera;
  };
  
  uniform mat4 model;
  #ifdef SKINNED
    uniform sampler2D bone_transforms;
  #endif

  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  #ifdef VERTEX_TANGENTS
    in vec3 tangent;
  #endif
  #ifdef SKINNED
    in uvec4 joint_index;
    in vec4 joint_weight;
  #endif
  
  out vec3 v_position;
  out vec2 v_uv;
  #ifdef VERTEX_NORMALS
    out vec3 v_normal;
  #endif
  #ifdef VERTEX_TANGENTS
    out vec3 v_tangent;
  #endif
  out vec3 cam_direction;

  void main(){
    #ifdef SKINNED
      mat4 boneMat0 = get_value_from_texture(joint_index.x, bone_transforms);
      mat4 boneMat1 = get_value_from_texture(joint_index.y, bone_transforms);
      mat4 boneMat2 = get_value_from_texture(joint_index.z, bone_transforms);
      mat4 boneMat3 = get_value_from_texture(joint_index.w, bone_transforms);

      vec4 skeleton_space_position = vec4(position, 1.0);
      vec4 skinned_position =
        (boneMat0 * skeleton_space_position) * joint_weight.x +
        (boneMat1 * skeleton_space_position) * joint_weight.y +
        (boneMat2 * skeleton_space_position) * joint_weight.z +
        (boneMat3 * skeleton_space_position) * joint_weight.w;
      mat3 normal_matrix = mat3(model);
      vec3 world_space_position = (model * skinned_position).xyz;
    #else
      vec3 world_space_position = (model * vec4(position,1.0)).xyz;
      mat3 normal_matrix = mat3(model);
    #endif
    
    v_position = world_space_position;
    v_uv = uv;
    #ifdef VERTEX_NORMALS
      v_normal = normal_matrix * normal;
    #endif
    #ifdef VERTEX_TANGENTS
      v_tangent = normal_matrix * tangent;
    #endif
    cam_direction = camera.cam_position - world_space_position;
    gl_Position = camera.projection * camera.view * vec4(world_space_position, 1.0);
  }
`