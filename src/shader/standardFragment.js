export const standardFragment =
  `
  precision mediump float;

  #include <common>
  #include <math>

  struct StandardMaterial {
    vec4 color;
    float metallic;
    float roughness;
  };

  in vec3 v_position;
  in vec2 v_uv;
  in vec3 v_normal;
  in vec3 cam_direction;
  
  uniform StandardMaterialBlock {
    StandardMaterial material;
  };
  
  uniform AmbientLightBlock {
    AmbientLight ambient_light;
  };
  uniform DirectionalLightBlock {
    DirectionalLights directional_lights;
  };
  uniform sampler2D mainTexture;
  
  out vec4 fragment_color;
  
  vec3 quickSRGBtoLinear(vec3 c) {
    return pow(c, vec3(2.2));
  }
  
  vec3 quickLineartoSRGB(vec3 c) {
    return pow(c, 1.0 / vec3(2.2));
  }
  
  vec3 fresnel_schlick(float cosTheta, vec3 F0){
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }  

float distribution_GGX(vec3 N, vec3 H, float roughness){
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return a2 / denom;
}

float geometry_schlickGGX(float NdotV, float roughness){
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  
  float num = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  
  return num / denom;
}
float geometry_smith(vec3 N, vec3 V, vec3 L, float roughness){
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometry_schlickGGX(NdotV, roughness);
  float ggx1 = geometry_schlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

  void main(){
    vec3 sample_color = quickSRGBtoLinear(texture(mainTexture,v_uv).rgb);
    vec3 base_color = tint(sample_color, material.color.rgb);
    vec3 N = normalize(v_normal);
    vec3 V = normalize(cam_direction);
    
    float roughness = clamp(material.roughness, 0.05, 1.0);
    float metallic = clamp(material.metallic, 0.0, 1.0);
    float NdotV = dot(N,V);
    float opacity = material.color.a;
    
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);
    
    vec3 L0;
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      
      vec3 L = -light.direction;
      vec3 H = normalize(L + V);
      
      vec3 radiance = light.color.rgb * light.intensity;
      float NdotL = max(dot(N,L), 0.0);
      float HdotV = max(dot(H,V), 0.0);

      vec3 F0 = mix(vec3(0.04), base_color, metallic);
      vec3 F = fresnel_schlick(HdotV, F0);
      
      float NDF = distribution_GGX(N, H, roughness);
      float G = geometry_smith(N, V, L, roughness);
      
      vec3 numerator = NDF * G * F;
      float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0)  + 0.0001;
      vec3 specular = numerator / denominator;
      vec3 kS = F;
      vec3 kD = vec3(1.0) - kS;
      kD *= 1.0 - metallic;
      
      L0 += (kD * base_color / PI + specular) * radiance * NdotL;
    }
    
    vec3 ambient = base_color * ambient_light.color.rgb * ambient_light.intensity;
    vec3 final_color = ambient + L0;
    
    // tonemap the output
    final_color = final_color / (final_color + vec3(1.0));
    
    // gamma correction
    final_color = quickLineartoSRGB(final_color); 

    fragment_color = vec4(final_color,opacity);
  }
`