import { ViewBindGroup } from "../../../renderer/resources/viewbindgroup.js"

export const ShadowViewBindings = {
  shadowCasterBlock: ViewBindGroup.uniform(11, "ShadowCasterBlock"),
  shadowAtlas: {
    texture: ViewBindGroup.texture(3, "shadow_atlas", "2d-array"),
    sampler: ViewBindGroup.sampler(4, "shadow_atlas")
  }
}
