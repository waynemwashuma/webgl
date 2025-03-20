import { Shader } from "./shader.js"
import { Color, Vector3 } from "../Math/index.js"

let vshader =
  `#version 300 es
  precision mediump float;
  
  uniform camera {
    mat4 view;
    mat4 projection;
    vec3 camPosition;
  };
  
  uniform mat4 model;
  
  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  
  out vec2 v_uv;
  out vec3 v_normal;
  out vec3 camDirection;
  
  void main(){
    gl_Position = projection * view * model * vec4(position,1.0);
    mat3 invNormalMat = mat3(model);
    v_uv = uv;
    v_normal = normalize(invNormalMat * normal);
    camDirection =  gl_Position.xyz - camPosition;
  }
`
let fshader =
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

export class PhongMaterial extends Shader {
  constructor(options) {
    let {
      color = new Color(1, 1, 1),
        opacity = 1.0,
        mains,
        mainTexture = null,
        lightDir = new Vector3(0, 0, -1),

        ambientColor = new Color(1, 1, 1),
        ambientIntensity = 0.15,

        diffuseColor = new Color(1, 1, 1),
        diffuseIntensity = 0.65,

        specularStrength = 0.15,
        specularShininess = 4,
    } = options

    super(vshader, fshader, {
      color,
      mains,
      ambientColor,
      ambientIntensity,
      opacity,
      lightDir,
      diffuseColor,
      diffuseIntensity,
      specularShininess,
      specularStrength
    })
    if (mainTexture) this.setUniform("mainTexture", mainTexture)
  }
}