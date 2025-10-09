export const lambertFragment =
  `
  precision mediump float;

  #include <common>
  
  struct LambertMaterial {
    vec4 color;
  };

  in vec3 v_position;
  in vec2 v_uv;
  in vec3 v_normal;
  
  uniform LambertMaterialBlock {
    LambertMaterial material;
  };
  // Lights
  uniform AmbientLightBlock {
    AmbientLight ambient_light;
  };
  uniform DirectionalLightBlock {
    DirectionalLights directional_lights;
  };
  uniform sampler2D mainTexture;
  
  out vec4 fragment_color;

  void main(){
    vec3 sample_color = texture(mainTexture,v_uv).rgb;
    vec3 base_color = tint(sample_color, material.color.rgb);
    vec3 normal = normalize(v_normal);
    float opacity = material.color.a;
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);

    vec3 ambient = ambient_light.color.rgb * ambient_light.intensity;
    
    vec3 accumulative_diffuse = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      
      //Remember you set the dir to negative because direction to light is the opposite direction of dir.
      float brightness = calculate_brightness(normal, -light.direction);
      vec3 diffuse = base_color * light.color.rgb * brightness * light.intensity;
      
      accumulative_diffuse += base_color * diffuse;
    }
    
    vec3 final_color = ambient * base_color + accumulative_diffuse;
    
    fragment_color = vec4(final_color,opacity);
  }
`