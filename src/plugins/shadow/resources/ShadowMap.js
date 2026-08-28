import { Object3D } from "../../../objects";
import { TextureType, TextureFormat, TextureWrap, TextureFilter } from "../../../constants";
import { Texture, Sampler } from "../../../texture";
import { Vector2 } from "../../../math/index.js"


export class ShadowMap {
  /**
   * Packed shadow rectangles tracked per active atlas layer.
   * @private
   * @type {ShadowAtlasPage[]}
   */
  pages = []

  shadowAtlas = new Texture({
    type: TextureType.Texture2DArray,
    format: TextureFormat.Depth32Float
  });

  sampler = new Sampler({
    wrapR: TextureWrap.Clamp,
    wrapS: TextureWrap.Clamp,
    wrapT: TextureWrap.Clamp,
    minificationFilter: TextureFilter.Nearest,
    magnificationFilter: TextureFilter.Nearest,
    mipmapFilter: undefined
  });

  maxDepth = 0;

  /**
   * @param {import("../../../core/index.js").WebGLRenderDevice} renderDevice
   */
  constructor(renderDevice) {
    const { maxTextureArrayLayers, maxTextureDimension2D } = renderDevice.limits
    const atlasWidth = maxTextureDimension2D
    const atlasHeight = maxTextureDimension2D
    const atlasDepth = maxTextureArrayLayers

    this.maxDepth = atlasDepth
    this.shadowAtlas.width = atlasWidth
    this.shadowAtlas.height = atlasHeight
    this.shadowAtlas.depth = 1
    this.pages = []
  }

  /**
   * @type {Map<Object3D, ShadowArea>}
   */
  inner = new Map();

  reset() {
    this.pages.length = 0
    if (this.shadowAtlas.depth !== 1) {
      this.shadowAtlas.depth = 1
    }
    this.inner.forEach((area) => {
      area.enabled = false;
      area.spaceIndex = -1;
    });
  }

  /**
   * Allocates a packed rectangle across one or more consecutive layers.
   *
   * @param {Vector2} resolution
   * @param {number} [layers=1]
   * @returns {ShadowAllocation | undefined}
   */
  allocate(resolution, layers = 1) {
    const atlasWidth = this.shadowAtlas.width
    const atlasHeight = this.shadowAtlas.height
    const width = Math.max(1, Math.ceil(resolution?.x ?? atlasWidth))
    const height = Math.max(1, Math.ceil(resolution?.y ?? atlasHeight))
    const layerCount = Math.max(1, Math.ceil(layers))

    if (width > atlasWidth || height > atlasHeight) {
      console.error("Shadow resolution exceeds the atlas size")
      return undefined
    }

    if (layerCount > this.maxDepth) {
      console.error("Shadow allocation requires more layers than the atlas provides")
      return undefined
    }

    ensurePageCount(this.pages, this.shadowAtlas, layerCount)

    while (true) {
      for (let baseLayer = 0; baseLayer <= this.pages.length - layerCount; baseLayer++) {
        const location = findAllocationLocation(this.pages, baseLayer, layerCount, width, height, atlasWidth, atlasHeight)

        if (!location) {
          continue
        }

        const allocation = new ShadowAllocation()
        allocation.layer = baseLayer
        allocation.offset.x = location.x
        allocation.offset.y = location.y
        allocation.size.x = width
        allocation.size.y = height

        const rect = new ShadowAtlasRect()
        rect.x = location.x
        rect.y = location.y
        rect.width = width
        rect.height = height

        for (let layer = baseLayer; layer < baseLayer + layerCount; layer++) {
          const page = this.pages[layer]

          if (!page) {
            continue
          }

          page.rects.push(rect.clone())
        }

        return allocation
      }

      if (this.pages.length >= this.maxDepth) {
        break
      }

      this.pages.push(new ShadowAtlasPage())
      ensurePageCount(this.pages, this.shadowAtlas, this.pages.length)
    }

    console.error("Shadow atlas is full, some shadows will be ignored")
    return undefined
  }

  /**
   * @param {Object3D} object
   */
  getOrSet(object) {
    const item = this.inner.get(object);

    if (item) {
      return item;
    }

    const newItem = new ShadowArea();

    this.inner.set(object, newItem);
    return newItem;
  }
}

export class ShadowArea {
  enabled = false;
  spaceIndex = -1;
}

class ShadowAtlasPage {
  /**
   * @type {ShadowAtlasRect[]}
   */
  rects = []

  clear() {
    this.rects.length = 0
  }
}

class ShadowAtlasRect {
  x = 0
  y = 0
  width = 0
  height = 0

  clone() {
    const rect = new ShadowAtlasRect()
    rect.x = this.x
    rect.y = this.y
    rect.width = this.width
    rect.height = this.height
    return rect
  }
}

export class ShadowAllocation {
  layer = 0
  offset = new Vector2()
  size = new Vector2()
}

/**
 * @param {ShadowAtlasPage[]} pages
 * @param {number} baseLayer
 * @param {number} layerCount
 * @param {number} width
 * @param {number} height
 * @param {number} atlasWidth
 * @param {number} atlasHeight
 * @returns {{ x: number, y: number } | undefined}
 */
function findAllocationLocation(pages, baseLayer, layerCount, width, height, atlasWidth, atlasHeight) {
  const xCandidates = new Set([0, atlasWidth - width])
  const yCandidates = new Set([0, atlasHeight - height])

  for (let layer = baseLayer; layer < baseLayer + layerCount; layer++) {
    const page = pages[layer]

    if (!page) {
      continue
    }

    for (let i = 0; i < page.rects.length; i++) {
      const rect = page.rects[i]

      if (!rect) {
        continue
      }

      xCandidates.add(rect.x)
      xCandidates.add(rect.x + rect.width)
      yCandidates.add(rect.y)
      yCandidates.add(rect.y + rect.height)
    }
  }

  const xs = Array.from(xCandidates)
    .filter((value) => value >= 0 && value + width <= atlasWidth)
    .sort((a, b) => a - b)
  const ys = Array.from(yCandidates)
    .filter((value) => value >= 0 && value + height <= atlasHeight)
    .sort((a, b) => a - b)

  for (let yi = 0; yi < ys.length; yi++) {
    const y = ys[yi]

    if (y === undefined) {
      continue
    }

    for (let xi = 0; xi < xs.length; xi++) {
      const x = xs[xi]

      if (x === undefined) {
        continue
      }

      if (fitsInLayers(pages, baseLayer, layerCount, x, y, width, height)) {
        return { x, y }
      }
    }
  }

  return undefined
}

/**
 * @param {ShadowAtlasPage[]} pages
 * @param {number} baseLayer
 * @param {number} layerCount
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
function fitsInLayers(pages, baseLayer, layerCount, x, y, width, height) {
  const right = x + width
  const bottom = y + height

  for (let layer = baseLayer; layer < baseLayer + layerCount; layer++) {
    const page = pages[layer]

    if (!page) {
      continue
    }

    const rects = page.rects

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]

      if (!rect) {
        continue
      }

      if (rect.x < right && x < rect.x + rect.width && rect.y < bottom && y < rect.y + rect.height) {
        return false
      }
    }
  }

  return true
}

/**
 * Ensures the atlas has at least the requested number of active layers.
 *
 * @param {ShadowAtlasPage[]} pages
 * @param {Texture} shadowAtlas
 * @param {number} layerCount
 */
function ensurePageCount(pages, shadowAtlas, layerCount) {
  const targetCount = Math.max(1, Math.ceil(layerCount))

  while (pages.length < targetCount) {
    pages.push(new ShadowAtlasPage())
  }

  if (shadowAtlas.depth !== pages.length) {
    shadowAtlas.depth = pages.length
  }
}
