export const phongFragment =
  `#version 300 es
  precision mediump float;
  
  in float brightness;
  in vec2 v_uv;
  in vec3 v_normal;
  in vec3 camDirection;
  
  uniform AmbientLight {
    float intensity;
    vec4 color;
  } ambient_light;
  
  uniform sampler2D mainTexture;
  uniform sampler2D mainz;
  uniform vec3 lightDir;
  uniform float ambientIntensity;
  uniform vec4 ambientColor;
  uniform float diffuseIntensity;
  uniform float specularShininess;
  uniform float specularStrength;
  uniform float opacity;
  uniform vec4 color;
  uniform vec4 diffuseColor;
  
  out vec4 FragColor;
 
 //Remember you set the dir to negative because light direction is the opposite direction of dir.
 float calcBrightness(vec3 normal, vec3 dir) {
   return max(
     dot(normal, -dir),
     0.0
   );
 }
 
 void main(){
    vec3 baseColor = texture(mainz,v_uv).xyz * color.xyz;
    if(baseColor == vec3(0.0,0.0,0.0))
      baseColor = color.xyz;
    vec3 ambient = ambient_light.color.xyz * ambient_light.intensity;
    
    float diffusebrightness = calcBrightness(v_normal,lightDir);
    vec3 diffuse = diffuseColor.xyz * diffusebrightness * diffuseIntensity;
    
    vec3 reflectNorm = reflect(lightDir,v_normal);
    float specularBrightness = calcBrightness(reflectNorm,camDirection);
    vec3 specular = pow(specularBrightness,specularShininess) * diffuseColor.xyz * specularStrength * diffuse;
    
    vec3 finalColor = baseColor * (ambient + diffuse + specular );
    FragColor = vec4(finalColor,opacity);
}
`