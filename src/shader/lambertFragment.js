export const lambertFragment =
  `#version 300 es
  precision mediump float;
  
  in float brightness;
  in vec2 v_uv;
  in vec3 v_normal;
  in mat3 invNormalMat;
  
  uniform sampler2D mainTexture;
  uniform vec3 lightDir;
  uniform float ambientIntensity;
  uniform vec4 ambientColor;
  uniform float diffuseIntensity;
  uniform float opacity;
  uniform vec4 color;
  uniform vec4 lightColor;
  
  out vec4 FragColor;
 
 //Remember you set the dir to negative because light direction is the opposite direction of dir.
 float calcBrightness(vec3 normal, vec3 dir) {
   return max(
     dot(normalize(normal), -dir),
     0.0
   );
 }
 
 void main(){
    vec3 baseColor = texture(mainTexture,v_uv).xyz * color.xyz;
    if(baseColor == vec3(0.0,0.0,0.0))
      baseColor = color.xyz;
    vec3 ambient = ambientColor.xyz * ambientIntensity;
    
    float brightness = calcBrightness(invNormalMat * v_normal,lightDir);
    
    vec3 diffuse = lightColor.xyz * brightness * diffuseIntensity;
    
    vec3 finalColor = baseColor * (ambient + diffuse);
    FragColor = vec4(finalColor,opacity);
}
`