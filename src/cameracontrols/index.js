import { Affine3, clamp, Vector2, Vector3 } from "../math/index.js"
import { Camera } from "../objects/index.js"

export class OrbitCameraControls {
  elevation = 0
  azimuth = 0
  distance = 5
  tideLocked = true
  offset = new Vector3()
  minElevation = -Math.PI / 2
  maxElevation = Math.PI / 2
  sensitivity = 0.02
  camera
  /**
   * @type {Set<string>}
   */
  keys = new Set()
  mousePosition = new Vector2()
  mouseDelta = new Vector2()
  /**
   * @param {Camera} camera
   */
  constructor(camera) {
    this.camera = camera
    addEventListener('keydown',keyPressed.bind(this))
    addEventListener('keyup',keyReleased.bind(this))
    addEventListener('mousedown',mouseDown.bind(this))
    addEventListener('mouseup',mouseUp.bind(this))
    addEventListener('mousemove',mousemove.bind(this))
    addEventListener('contextmenu',(e)=>e.preventDefault())
  }

  updateOrbit() {
    const { position, orientation } = this.camera.transform
    const { offset: target } = this
    const eye = new Vector3(
      this.distance * Math.sin(this.azimuth) * Math.cos(this.elevation),
      this.distance * Math.sin(this.elevation),
      this.distance * Math.cos(this.azimuth) * Math.cos(this.elevation)
    ).add(target)
    const initial = Affine3.lookAt(eye, target, Vector3.Y)
    const [finalPos, finalOrient, _] = initial.decompose()

    position.x = finalPos.x
    position.y = finalPos.y
    position.z = finalPos.z

    if (this.tideLocked) {
      orientation.x = finalOrient.x
      orientation.y = finalOrient.y
      orientation.z = finalOrient.z
      orientation.w = finalOrient.w
    }
  }

  updateInput() {
    const delta = this.mouseDelta
    const input = new Vector2()

    if (this.keys.has('KeyW')) {
      input.y -= 1
    }
    if (this.keys.has('KeyS')) {
      input.y += 1
    }
    if (this.keys.has('KeyD')) {
      input.x += 1
    }
    if (this.keys.has('KeyA')) {
      input.x -= 1
    }

    if (this.keys.has('mouseright')) {
      this.azimuth += -delta.x * this.sensitivity
      this.elevation += delta.y * this.sensitivity
      this.elevation = clamp(this.elevation, this.minElevation, this.maxElevation)
    }

    Vector2.rotate(input, -this.azimuth, input)
    this.offset.x += input.x
    this.offset.z += input.y
  }

  update(){
    this.updateInput()
    this.updateOrbit()
  }
}

/**
 * @this {OrbitCameraControls}
 * @param {KeyboardEvent} event
 */
function keyPressed(event){
  this.keys.add(event.key)
}

/**
 * @this {OrbitCameraControls}
 * @param {KeyboardEvent} event
 */
function keyReleased(event){
  this.keys.delete(event.key)
}

/**
 * @this {OrbitCameraControls}
 * @param {MouseEvent} event
 */
function mouseDown(event){
  event.preventDefault()
  switch (event.button) {
    case 0:
      this.keys.add('mouseleft')
      break;
    case 2:
      this.keys.add('mouseright')
      break;
  }
}

/**
 * @this {OrbitCameraControls}
 * @param {MouseEvent} event
 */
function mouseUp(event) {
  event.preventDefault()
  switch (event.button) {
    case 0:
      this.keys.delete('mouseleft')
      break;
    case 2:
      this.keys.delete('mouseright')
      break;
  }
}

/**
 * @this {OrbitCameraControls}
 * @param {MouseEvent} event
 */
function mousemove(event){
  this.mouseDelta.copy(this.mousePosition)
  this.mousePosition.set(event.clientX,event.clientY)
  this.mouseDelta.subtract(this.mousePosition).reverse()
}