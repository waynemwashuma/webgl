export const normalFragment =
  `
  precision mediump float;

  struct NormalMaterial {
    vec4 padding;
  };

  in vec3 v_normal;
  
  out vec4 fragment_color;

  uniform BasicMaterialBlock {
    NormalMaterial material;
  };

  void main(){
    fragment_color = vec4(v_normal, 1.0);
  }
`