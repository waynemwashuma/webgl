export const basicFragment =
  `#version 300 es
  precision mediump float;
  
  uniform sampler2D mainTexture;
  uniform vec4 color;
  
  in vec2 v_uv;
  
  out vec4 final_color;
  
  vec3 tint(vec3 tex_color, vec3 tint){
  
    if (tex_color == vec3(0.0, 0.0, 0.0))
      return tint;
    return tex_color * tint;
  }
  void main(){
    float opacity = color.a;
    vec4 sample_color = texture(mainTexture,v_uv);
    final_color.xyz = tint(sample_color.xyz,color.xyz);
    final_color.a = opacity;
}
`