struct MeshInstance {
  mat4 transform;
  uint skin_index;
  uint bone_count;
  uint morph_target_count;
  vec4 morph_weights[4];
};

mat4 get_skin_bone(MeshInstance mesh_instance, uint joint_index, sampler2DArray bone_transforms) {
  if (mesh_instance.bone_count == 0u) {
    return mat4(1.0);
  }

  uint resolved_joint = min(joint_index, mesh_instance.bone_count - 1u);
  return get_value_from_texture(mesh_instance.skin_index + resolved_joint, bone_transforms);
}

float get_morph_weight(MeshInstance mesh_instance, uint morph_target_index) {
  if (morph_target_index >= mesh_instance.morph_target_count) {
    return 0.0;
  }

  uint weight_vector_index = morph_target_index / 4u;
  uint weight_component_index = morph_target_index % 4u;
  vec4 weights = mesh_instance.morph_weights[int(weight_vector_index)];

  if (weight_component_index == 0u) {
    return weights.x;
  }

  if (weight_component_index == 1u) {
    return weights.y;
  }

  if (weight_component_index == 2u) {
    return weights.z;
  }

  return weights.w;
}
