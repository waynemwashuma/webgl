---
title: "Textures and Assets"
---

# Textures and Assets

Use loaders for textures and model files.

## Texture Loading

```js
import { TextureLoader } from "webgllis";

const textureLoader = new TextureLoader();
const texture = textureLoader.load({
  paths: ["/assets/images/uv.jpg"],
  textureSettings: { flipY: true }
});
```

## OBJ Loading

```js
import { OBJLoader } from "webgllis";

const objLoader = new OBJLoader();
const objRoot = objLoader.load({
  paths: ["/assets/models/mesh.obj"]
});
```

## glTF Loading

```js
import { GLTFLoader } from "webgllis";

const gltfLoader = new GLTFLoader();
const sceneRoot = gltfLoader.load({
  paths: ["/assets/models/scene.gltf"]
});
```

`load()` returns an object immediately and fills it as data arrives. Use placeholder visuals while async assets stream in.

Complete examples:

- [OBJ Loader](/examples/loader/objloader)
- [glTF Loader](/examples/loader/gltfloader)
- [glTF Material Example](/examples/loader/gltf_material)
