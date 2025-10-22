import texture from "./texture/index.js"
import material from "./material/index.js"
import mesh from "./mesh/index.js"
import loader from "./loader/index.js"
import others from "./other/index.js"
import skyBox from "./skybox/index.js"
import transform from "./transform/index.js"

/**@type {Record<string, any>} */
export const demos = {
  "material": material,
  "mesh": mesh,
  "texture": texture,
  "transform": transform,
  "skybox": skyBox,
  "loaders": loader,
  "others":others,
}