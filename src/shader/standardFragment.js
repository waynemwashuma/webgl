export const standardFragment =
  `
  precision mediump float;

  #include <common>
  #include <light>
  #include <math>

  struct PBRInput {
    float NdotL;
    float NdotV;
    float NdotH;
    float HdotV;
  };

  struct PBRProperties {
    vec3 normal;
    vec3 albedo;
    vec3 emissive;
    float opacity;
    float metallic;
    float roughness; 
    float ambient_occlusion;
  };

  struct StandardMaterial {
    vec4 color;
    float metallic;
    float roughness;
    float ambient_occlusion_strength;
    vec3 emissive_color;
    float emissive_intensity;
  };

  in vec3 v_position;
  in vec2 v_uv;
  in vec3 v_normal;
  in vec3 v_tangent;
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
  uniform sampler2D normal_texture;
  uniform sampler2D occlusion_texture;
  uniform sampler2D roughness_texture;
  uniform sampler2D metallic_texture;
  uniform sampler2D emissive_texture;

  out vec4 fragment_color;
  
  vec3 quick_sRGB_to_linear(vec3 color) {
    return pow(color, vec3(2.2));
  }
  
  vec3 quick_linear_to_sRGB(vec3 color) {
    return pow(color, 1.0 / vec3(2.2));
  }
  
  vec3 fresnel_schlick(float HdotV, vec3 F0){
    return F0 + (1.0 - F0) * pow(clamp(1.0 - HdotV, 0.0, 1.0), 5.0);
  }

  // Also the Trowbridge-Rietz normal distribution function
  float GGX_normal_distribution(float NdotH, float roughness){
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH2 = NdotH * NdotH;  
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
  
    return a2 / denom;
  }

  float geometry_schlickGGX(float NdotV, float roughness){
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    float denom = NdotV * (1.0 - k) + k;

    return NdotV / denom;
  }

  float geometry_smith(float NdotV, float NdotL, float roughness){
    float ggx2 = geometry_schlickGGX(NdotV, roughness);
    float ggx1 = geometry_schlickGGX(NdotL, roughness);
  
    return ggx1 * ggx2;
  }

  vec3 cook_torrance_BRDF(PBRProperties pbr_properties, PBRInput pbr_input){
    vec3 F0 = mix(vec3(0.04), pbr_properties.albedo, pbr_properties.metallic);
    vec3 F = fresnel_schlick(pbr_input.HdotV, F0);

    float NDF = GGX_normal_distribution(pbr_input.NdotH, pbr_properties.roughness);
    float G = geometry_smith(pbr_input.NdotV, pbr_input.NdotL, pbr_properties.roughness);

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * pbr_input.NdotV * pbr_input.NdotL  + 0.0001;
    vec3 specular = numerator / denominator;
    vec3 kS = F;
    vec3 kD = (vec3(1.0) - kS) * (1.0 - pbr_properties.metallic);

    return (kD * pbr_properties.albedo / PI + specular);
  }

  PBRInput calculate_pbr_input(vec3 N, vec3 V, vec3 L, vec3 H){
    PBRInput pbr_input;

    pbr_input.NdotV = max(dot(N, V), 0.0);
    pbr_input.NdotL = max(dot(N, L), 0.0);
    pbr_input.NdotH = max(dot(N, H), 0.0);
    pbr_input.HdotV = max(dot(H, V), 0.0);

    return pbr_input;
  }

  PBRProperties calculate_pbr_properties(){
    PBRProperties properties;

    properties.albedo = material.color.rgb;
    properties.emissive = material.emissive_color;
    properties.opacity = material.color.a;
    properties.metallic = material.metallic;
    properties.roughness = material.roughness;

    vec4 albedo_texture_color = texture(mainTexture,v_uv);
    properties.albedo *= quick_sRGB_to_linear(albedo_texture_color.rgb);
    properties.opacity *= albedo_texture_color.a;
    
    vec4 metallic_texture_color = texture(metallic_texture,v_uv);
    properties.metallic *= metallic_texture_color.b;

    vec4 roughness_texture_color = texture(roughness_texture,v_uv);
    properties.roughness *= roughness_texture_color.g;

    vec4 occlusion_texture_color = texture(occlusion_texture,v_uv);
    properties.ambient_occlusion = mix(1.0,occlusion_texture_color.r, material.ambient_occlusion_strength);

    vec4 emissive_texture_color = texture(mainTexture,v_uv);
    properties.emissive *= emissive_texture_color.rgb;
    
    properties.metallic = clamp(properties.metallic, 0.0, 1.0);
    properties.roughness = clamp(properties.roughness, 0.05, 1.0);

    vec3 normal = normalize(v_normal);
    vec3 tangent = normalize(v_tangent);
    vec3 bitangent = cross(normal, tangent);
    mat3 tangent_space = mat3(tangent, bitangent, normal);
    vec3 surface_normal = texture(normal_texture, v_uv).rgb * 2.0 - 1.0;
    properties.normal = tangent_space * surface_normal;

    return properties;
  }

  void main(){
    PBRProperties pbr_properties = calculate_pbr_properties();
    vec3 N = pbr_properties.normal;
    vec3 V = normalize(cam_direction);
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);

    vec3 exitance;
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      vec3 L = -light.direction;
      vec3 H = normalize(L + V);
      vec3 irradiance = light.color.rgb * light.intensity;
      PBRInput pbr_input = calculate_pbr_input(N, V, L, H);
      
      exitance += cook_torrance_BRDF(pbr_properties, pbr_input) * irradiance * pbr_input.NdotL;
    }

    vec3 emissive_exitance = pbr_properties.emissive * material.emissive_intensity;
    vec3 ambient_exitance = pbr_properties.albedo * ambient_light.color.rgb * ambient_light.intensity * pbr_properties.ambient_occlusion;
    vec3 final_color = emissive_exitance + ambient_exitance + exitance;

    // tonemapping output
    // this is temporary until a post processing step is introduced
    final_color = final_color / (final_color + vec3(1.0));

    // gamma correction
    // this is temporary until a post processing step is introduced
    final_color = quick_linear_to_sRGB(final_color); 

    fragment_color = vec4(final_color, pbr_properties.opacity);
  }
`