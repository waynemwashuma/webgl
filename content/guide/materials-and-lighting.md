---
title: "Materials and Lighting"
---

# Materials and Lighting

Choose material models based on look and cost, then add light plugins and light objects.

## Material Choices

```js
import { BasicMaterial, LambertMaterial, PhongMaterial, StandardMaterial } from "webgllis";

const basic = new BasicMaterial();
const lambert = new LambertMaterial();
const phong = new PhongMaterial();
const standard = new StandardMaterial({ roughness: 0.5, metallic: 0.1 });
```

## Required Plugins for Lit Scenes

```js
import { WebGLRenderer, MeshMaterialPlugin, LightPlugin, CameraPlugin } from "webgllis";

const renderer = new WebGLRenderer({
  plugins: [new LightPlugin(), new MeshMaterialPlugin(), new CameraPlugin()]
});
```

## Lights

```js
import { AmbientLight, DirectionalLight } from "webgllis";

const ambient = new AmbientLight();
ambient.intensity = 0.15;

const sun = new DirectionalLight();
sun.transform.orientation.rotateX(-Math.PI / 4);
```

Complete examples:

- [Directional Light](/examples/lights/directional)
- [Point Light](/examples/lights/point)
- [Spot Light](/examples/lights/spot)
