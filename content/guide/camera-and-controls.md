---
title: "Camera and Controls"
---

# Camera and Controls

Use `Camera` plus a projection and optional orbit controls.

## Perspective Camera

```js
import { Camera, PerspectiveProjection, CanvasTarget } from "webgllis";

const target = new CanvasTarget(canvas);
const camera = new Camera(target);
camera.transform.position.z = 3;

if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 3;
  camera.projection.aspect = innerWidth / innerHeight;
}
```

## Orbit Controls

```js
import { OrbitCameraControls } from "webgllis";

const controls = new OrbitCameraControls(camera, canvas);
controls.distance = 4;

function update() {
  controls.update();
  renderer.render([object, camera], device);
  requestAnimationFrame(update);
}
```

## Keep Aspect Ratio Updated

```js
addEventListener("resize", () => {
  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight;
  }
});
```

Complete examples:

- [Perspective Camera](/examples/camera/perspective)
- [Orthographic Camera](/examples/camera/orthographic)
