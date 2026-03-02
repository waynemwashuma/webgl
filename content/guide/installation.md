---
title: "Installation"
---

# Installation

## Requirements

- Node.js 18+
- npm
- Browser with WebGL2 support

## Install Dependencies

```bash
npm install
```

## Build Library and Website

```bash
npm run build
```

Expected output includes:

- `dist/index.umd.js`
- `dist/index.module.js`
- `dist/website/`

## Run Docs/Examples Locally

```bash
npm run dev
```

Open `http://localhost:4321` (Astro default).

## Quick Import Check

```js
import { WebGLRenderer, MeshMaterialPlugin, CameraPlugin } from "webgllis";

const renderer = new WebGLRenderer({
  plugins: [new MeshMaterialPlugin(), new CameraPlugin()]
});
```

See a full setup in [Basic Canvas Target](/examples/rendertarget/basic_canvas).
