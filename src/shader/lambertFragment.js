export const lambertFragment =
  `
  precision mediump float;

  #include <common>
  
  in vec3 v_position;
  in vec2 v_uv;
  in vec3 v_normal;
  
  uniform sampler2D mainTexture;
  uniform vec4 color;
  
  // Lights
  uniform AmbientLightBlock {
    AmbientLight ambient_light;
  };
  uniform DirectionalLightBlock {
    DirectionalLights directional_lights;
  };
  
  out vec4 fragment_color;

  void main(){
    float opacity = color.w;
    vec3 normal = normalize(v_normal);
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);
    vec3 base_color = texture(mainTexture,v_uv).xyz * color.xyz;
    if(base_color == vec3(0.0,0.0,0.0))
      base_color = color.xyz;
    vec3 ambient = ambient_light.color.xyz * ambient_light.intensity;
    
    vec3 accumulative_diffuse = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      
      //Remember you set the dir to negative because direction to light is the opposite direction of dir.
      float brightness = calculate_brightness(normal, -light.direction);
      vec3 diffuse = base_color * light.color.xyz * brightness * light.intensity;
      
      accumulative_diffuse += base_color * diffuse;
    }
    
    vec3 final_color = ambient * base_color + accumulative_diffuse;
    
    fragment_color = vec4(final_color,opacity);
  }
`