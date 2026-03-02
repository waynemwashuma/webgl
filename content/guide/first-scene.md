---
title: "First Scene"
---

# First Scene

This page builds a minimal scene using a textured cube and one camera.

## Minimal Setup

```js
import {
  WebGLRenderDevice,
  CanvasTarget,
  WebGLRenderer,
  Camera,
  MeshMaterial3D,
  BasicMaterial,
  CuboidMeshBuilder,
  MeshMaterialPlugin,
  CameraPlugin
} from "webgllis";

const canvas = document.createElement("canvas");
const device = new WebGLRenderDevice(canvas, { depth: true });
const target = new CanvasTarget(canvas);
const renderer = new WebGLRenderer({
  plugins: [new MeshMaterialPlugin(), new CameraPlugin()]
});
const camera = new Camera(target);
const cube = new MeshMaterial3D(new CuboidMeshBuilder().build(), new BasicMaterial());
```

## Render Loop

```js
function frame() {
  renderer.render([cube, camera], device);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

## Resize Handling

```js
function resize() {
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
}
```

Full example: [Rotating Cube](/examples/other/rotatingCube).
