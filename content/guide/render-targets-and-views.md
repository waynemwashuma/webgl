---
title: "Render Targets and Views"
---

# Render Targets and Views

Render to the main canvas or to offscreen images.

## Canvas Target

```js
import { CanvasTarget, Camera } from "webgllis";

const target = new CanvasTarget(canvas);
const camera = new Camera(target);
```

## Image Target (Offscreen)

```js
import { ImageRenderTarget, Texture, TextureType, TextureFormat } from "webgllis";

const imageTarget = new ImageRenderTarget({
  width: 1024,
  height: 1024,
  color: [
    new Texture({
      type: TextureType.Texture2D,
      format: TextureFormat.RGBA8Unorm,
      width: 1024,
      height: 1024
    })
  ]
});
```

## Multiple Views

```js
import { ViewRectangle } from "webgllis";

camera.target.viewport = new ViewRectangle();
camera.target.viewport.size.set(0.5, 1);
```

Use viewports/scissors to split screen output and build editor-style layouts.

Complete examples:

- [Basic Canvas Target](/examples/rendertarget/basic_canvas)
- [Image Target](/examples/rendertarget/image_target)
- [Split Screen](/examples/rendertarget/split_screen)
- [Multiple Views](/examples/rendertarget/multiple_views)
