---
title: "Troubleshooting"
---

# Troubleshooting

## Blank Canvas

- Confirm WebGL2 is available in your browser.
- Ensure you created `WebGLRenderDevice` with a valid canvas.
- Ensure `renderer.render([... , camera], device)` includes a camera.

```js
const device = new WebGLRenderDevice(canvas, { depth: true });
```

## Object Is Black or Unlit

- Add `LightPlugin` for lit materials.
- Add at least one light (`AmbientLight`, `DirectionalLight`, etc.).
- Keep `MeshMaterialPlugin` and `CameraPlugin` enabled.

## Distorted Aspect Ratio

Update canvas size and camera projection on resize.

```js
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.aspect = innerWidth / innerHeight;
}
```

## Missing Textures or Models

- Use correct asset URLs under `...`.
- Check browser network tab for 404s.
- For cube maps, provide all six faces in the expected order.

## Shadows Not Visible

- Add `ShadowPlugin`.
- Assign `light.shadow` and tune `bias`/`normalBias`.
- Verify shadow camera bounds include your objects.

Useful full examples:

- [Rotating Cube](/examples/other/rotatingCube)
- [Directional Light](/examples/lights/directional)
- [Image Target](/examples/rendertarget/image_target)
