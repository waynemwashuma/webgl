import {
  ATTR_POSITION_LOC,
  ATTR_NORMAL_LOC,
  ATTR_UV_LOC,
  ATTR_POSITION_NAME,
  ATTR_NORMAL_NAME,
  ATTR_UV_NAME,
  UniformTypes
} from "./constants.js"

import { Mesh } from "./meshes/mesh.js"
import {
  Shader,
  BasicMaterial,
  LambertMaterial
} from "./material/index.js"
import {
  BoxGeometry,
  Geometry,
  QuadGeometry,
  UVShereGeometry
} from "./geometry/index.js"
import { Vec3, Color } from "/math/index.js"
import { Renderer } from "./renderer.js"
import { Texture } from "./textures/index.js"
import { createUBO } from "./functions.js"

let canvas = document.getElementById("can")
let renderer = new Renderer(canvas)
let camera = renderer.camera
/**
 * @type {WebGL2RenderingContext}
 */
let gl = renderer.gl
let vshader =
  `#version 300 es
  precision mediump float;
  
  uniform camera {
    mat4 view;
    mat4 projection;
  };
  
  uniform mat4 model;
  //uniform mat4 projection;
  //uniform mat4 view;
  
  
  in vec3 position;
  in vec2 uv;
  in vec3 normal;
  
  uniform vec3 lightDir;
  uniform vec3 lightPos;
  
  out vec2 v_uv;
  out float brightness;
  
  float calcBrightness(vec3 normal,mat3 normalMatrix,vec3 dir){
    return max(
      dot(normalMatrix * normal,dir),
      0.0
    );
  }
  void main(){
    gl_Position = projection * view * model * vec4(position,1.0);
    v_uv = uv;
    mat3 invNormalMat = mat3(model);
    brightness = calcBrightness(normal,invNormalMat,lightDir);
  }
`
let fshader =
  `#version 300 es
  precision mediump float;
  uniform sampler2D texture;
uniform sampler2D texture2;

in float brightness;
in vec2 v_uv;

uniform float ambient;
out vec4 FragColor;

void main(){
vec4 color = FragColor = vec4(1.0,1.0,0.0,1.0);
  FragColor = color * ambient + 
    (1.0 - ambient) * color * brightness;
  //FragColor = vec4(v_uv,0.0,1.0);
  //FragColor = texture2D(texture,v_uv);
  //FragColor = texture2D(texture2,v_uv);
  //FragColor = vec4(color,1.0);
  //FragColor = mix(texture2D(texture,v_uv),texture2D(texture2,v_uv),0.2);
  //FragColor = vec4(v_uv,0.0,1.0) * brightness;
  FragColor.a = 1.0;
}
`

let tex = new Texture("./UV_Grid_Lrg.jpg")
let tex2 = new Texture("./texture.png")

let origin = new Mesh(
  new BoxGeometry(0.2, 0.2),
  new Shader(vshader, fshader)
)
let mesh = new Mesh(
  new UVShereGeometry(2),
  new LambertMaterial({
    lightPos: new Vec3(0, 1, 3),
    lightDir: new Vec3(0, 0, -1),
    ambientIntensity: 0.1,
  })
)

renderer.setViewport(300, 300)
renderer.setViewport(innerWidth, innerHeight)

camera.makePerspective(120)
camera.transform.position.z = 3
mesh.transform.position.x = 0

//renderer.add(origin)
renderer.add(mesh)

let angle = 0

function render(dt) {
  //mesh.transform.rotation.y += Math.PI / 1000
  //mesh.transform.rotation.z += Math.PI / 1000
  //mesh.transform.rotation.x += Math.PI / 100
  //camera.transform.rotation.z += Math.PI/100
  mesh.material.updateUniform("lightDir",
    new Vec3(
      Math.cos(angle),
      Math.sin(angle),
      Math.sin(angle)
    ).normalize()
  )
  renderer.update()
  requestAnimationFrame(render)
  angle += Math.PI / 100
}
render()