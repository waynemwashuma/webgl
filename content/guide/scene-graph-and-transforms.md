---
title: "Scene Graph and Transforms"
---

# Scene Graph and Transforms

`Object3D` supports hierarchical transforms and traversal.

## Parent-Child Relationships

```js
import { Object3D } from "webgllis";

const root = new Object3D();
root.add(childA);
childA.add(childB);
```

## Transform Updates

```js
childA.transform.position.x = 1;
childB.transform.orientation.rotateY(Math.PI * 0.01);

root.traverseDFS((node) => {
  node.update();
  return true;
});
```

## Typical Animation Pattern

```js
function tick() {
  object.transform.orientation.multiply(deltaRotation);
  renderer.render([root, camera], device);
  requestAnimationFrame(tick);
}
```

Complete examples:

- [Transform Propagation](/examples/transform/propagation)
- [Skinning](/examples/mesh/skinning)
