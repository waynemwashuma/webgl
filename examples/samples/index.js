import texture from "./texture/index.js"
import material from "./material/index.js"
import mesh from "./mesh/index.js"
import loader from "./loader/index.js"
import others from "./other/index.js"
import skyBox from "./skybox/index.js"
import renderTarget from "./rendertarget/index.js"
import transform from "./transform/index.js"
import lights from "./lights/index.js"

/**@type {Record<string, any>} */
export const demos = {
  "material": material,
  "mesh": mesh,
  "lights": lights,
  "texture": texture,
  "transform": transform,
  "skybox": skyBox,
  "render target":renderTarget,
  "loaders": loader,
  "others":others,
}