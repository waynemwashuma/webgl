export const phongFragment =
  `#version 300 es
  #define MAX_DIRECTIONAL_LIGHTS 10

  precision mediump float;
  

  in float brightness;
  in vec2 v_uv;
  in vec3 v_normal;
  in vec3 camDirection;

  struct DirectionalLight {
    vec4 color;
    vec3 direction;
    float intensity;
  };
  
  uniform AmbientLight {
    float intensity;
    vec4 color;
  } ambient_light;
  uniform DirectionalLights {
    int count;
    DirectionalLight lights[MAX_DIRECTIONAL_LIGHTS];
  } directional_lights;
  
  uniform vec4 color;
  uniform sampler2D mainTexture;
  uniform float specularShininess;
  uniform float specularStrength;
  
  out vec4 FragColor;
 
 float calcBrightness(vec3 normal, vec3 dir) {
   return max(
     dot(normal, dir),
     0.0
   );
 }
 
 void main(){
    float opacity = color.w;
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);
    vec3 normal = normalize(v_normal);
    vec3 baseColor = texture(mainTexture,v_uv).xyz * color.xyz;
    
    if(baseColor == vec3(0.0,0.0,0.0))
      baseColor = color.xyz;
    
    vec3 ambient = ambient_light.color.xyz * ambient_light.intensity;
    
    vec3 accumulate_light_contribution = vec3(0.0,0.0,0.0);
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      vec3 reflectNorm = reflect(-light.direction, v_normal);

      //Remember you set the dir to negative because light direction is the opposite direction of dir.
      float diffusebrightness = calcBrightness(normal,-light.direction);
      vec3 diffuse = light.color.xyz * diffusebrightness * light.intensity;
    
      float specularBrightness = calcBrightness(reflectNorm,camDirection);
      vec3 specular = pow(specularBrightness,specularShininess) * light.color.xyz * specularStrength * diffuse;
      accumulate_light_contribution += specular + diffuse;
    }
    vec3 finalColor = baseColor * (ambient + accumulate_light_contribution );
    FragColor = vec4(finalColor,opacity);
}
`