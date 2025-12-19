const meshTopology = new URL("./basic_canvas.js", import.meta.url)
const splitScreen = new URL("./split_screen.js", import.meta.url)
const multiViews = new URL("./multiple_views.js", import.meta.url)
const splitView = new URL("./split_view.js", import.meta.url)
const imageTarget = new URL("./image_target.js", import.meta.url)
const depthImage = new URL("./depth_texture.js", import.meta.url)

export default {
  "basic canvas": meshTopology,
  "split screen": splitScreen,
  "split view": splitView,
  "multiple views": multiViews,
  "image target":imageTarget,
  "depth target":depthImage
}