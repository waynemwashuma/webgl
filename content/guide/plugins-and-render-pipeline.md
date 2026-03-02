---
title: "Plugins and Render Pipeline"
---

# Plugins and Render Pipeline

The renderer is plugin-driven. Plugins preprocess objects and contribute render items.

## Common Plugin Stack

```js
import {
  WebGLRenderer,
  ShadowPlugin,
  LightPlugin,
  SkyboxPlugin,
  MeshMaterialPlugin,
  CameraPlugin
} from "webgllis";

const renderer = new WebGLRenderer({
  plugins: [
    new ShadowPlugin(),
    new LightPlugin(),
    new SkyboxPlugin(),
    new MeshMaterialPlugin(),
    new CameraPlugin()
  ]
});
```

## Render Lifecycle (High-Level)

```js
renderer.render(objects, device);
```

During `render()`:

1. Object transforms are updated.
2. Each plugin preprocesses and appends views/items.
3. Views are sorted and rendered.

## Plugin Roles

- `CameraPlugin`: creates camera views and view matrices.
- `MeshMaterialPlugin`: builds mesh draw items and material bindings.
- `LightPlugin`: contributes light data for lit shaders.
- `ShadowPlugin`: generates shadow resources and passes.
- `SkyboxPlugin`: injects skybox rendering.

Complete examples:

- [Directional Light + Shadows](/examples/lights/directional)
- [Skybox](/examples/skybox/skybox)
