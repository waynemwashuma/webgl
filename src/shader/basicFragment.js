export const basicFragment =
  `
  precision mediump float;
  
  #include <common>

  uniform sampler2D mainTexture;
  uniform vec4 color;
  
  in vec2 v_uv;
  
  out vec4 fragment_color;
  
  void main(){
    vec3 sample_color = texture(mainTexture,v_uv).rgb;
    float opacity = color.a;

    fragment_color = vec4(tint(sample_color,color.rgb), opacity);
  }
`