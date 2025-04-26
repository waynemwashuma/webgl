export const phongFragment =
  `
  precision mediump float;

  #include <common>
  
  in vec3 v_position;
  in vec2 v_uv;
  in vec3 v_normal;
  in vec3 cam_direction;
  
  uniform AmbientLightBlock {
    AmbientLight ambient_light;
  };
  uniform DirectionalLightBlock {
    DirectionalLights directional_lights;
  };
  
  uniform vec4 color;
  uniform sampler2D mainTexture;
  uniform float specularShininess;
  uniform float specularStrength;
  
  out vec4 fragment_color;
 
  void main(){
    vec3 view_direction = normalize(cam_direction);
    float opacity = color.w;
    int directional_light_count = min(directional_lights.count,MAX_DIRECTIONAL_LIGHTS);
    vec3 normal = normalize(v_normal);
    vec3 base_color = texture(mainTexture,v_uv).xyz * color.xyz;
    
    if(base_color == vec3(0.0,0.0,0.0))
      base_color = color.xyz;
    
    vec3 ambient = ambient_light.color.xyz * ambient_light.intensity;
    
    vec3 accumulate_light_contribution = vec3(0.0,0.0,0.0);
    for (int i = 0; i < directional_light_count; i++) {
      DirectionalLight light = directional_lights.lights[i];
      vec3 reflection_direction = reflect(light.direction, normal);
      
      //Remember you set the dir to negative because light direction is the opposite direction of dir.
      float diffuse_brightness = calculate_brightness(normal,-light.direction);
      vec3 diffuse = base_color * light.color.xyz * diffuse_brightness * light.intensity;
    
      float specular_brightness = calculate_brightness(reflection_direction,view_direction);
      vec3 specular = pow(specular_brightness,specularShininess) * light.color.xyz * specularStrength;
      accumulate_light_contribution += specular + diffuse;
    }
  
    vec3 final_color = base_color * ambient + accumulate_light_contribution;
    
    fragment_color = vec4(final_color, opacity);
  }
`