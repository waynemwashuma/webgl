export const basicFragment =
  `#version 300 es
  precision mediump float;
  
  uniform sampler2D mainTexture;
  uniform vec4 color;
  uniform float opacity;
  
  in vec2 v_uv;
  
  out vec4 final_color;
  
  vec3 tint(vec3 texColor, vec3 tint){
  
    if (texColor == vec3(0.0, 0.0, 0.0))
      return tint;
    return texColor * tint;
  }
  void main(){
    vec4 sampleColor = texture(mainTexture,v_uv);
    final_color.xyz = tint(sampleColor.xyz,color.xyz);
    final_color.a = opacity;
}
`