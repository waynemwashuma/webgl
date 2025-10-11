export const basicFragment =
  `
  precision mediump float;
  
  #include <common>

  struct BasicMaterial {
    vec4 color;
  };

  in vec2 v_uv;
  
  out vec4 fragment_color;

  uniform BasicMaterialBlock {
    BasicMaterial material;
  };
  uniform sampler2D mainTexture;
  
  void main(){
    vec3 sample_color = texture(mainTexture, v_uv).rgb;
    float opacity = material.color.a;

    fragment_color = vec4(tint(sample_color, material.color.rgb), opacity);
  }
`