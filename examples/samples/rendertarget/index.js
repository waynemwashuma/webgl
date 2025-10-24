const meshTopology = new URL("./basic_canvas.js", import.meta.url)
const splitScreen = new URL("./split_screen.js", import.meta.url)
const multiViews = new URL("./multiple_views.js", import.meta.url)

export default {
  "basic canvas": meshTopology,
  "split screen": splitScreen,
  "multiple views": multiViews
}