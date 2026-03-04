import { Affine3, clamp, Vector2, Vector3 } from "../math/index.js"
import { Camera } from "../objects/index.js"

export class OrbitCameraControls {
  #targetElement
  #mousedown
  #mouseup
  #mousemove
  #pointercancel
  #wheel
  #contextmenu
  #blur
  elevation = 0
  azimuth = 0
  distance = 5
  minDistance = 0.01
  maxDistance = Infinity
  tideLocked = true
  offset = new Vector3()
  minElevation = -Math.PI / 2
  maxElevation = Math.PI / 2
  sensitivity = 0.02
  moveSensitivity = 0.002
  zoomSensitivity = 0.001
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
  constructor(camera, targetElement = document.body) {
    this.camera = camera
    this.#targetElement = targetElement
    this.#mousedown = mouseDown.bind(this)
    this.#mouseup = mouseUp.bind(this)
    this.#mousemove = mousemove.bind(this)
    this.#pointercancel = cancelInput.bind(this)
    this.#wheel = mouseWheel.bind(this)
    this.#contextmenu = (/** @type {MouseEvent} */ e) => e.preventDefault()
    this.#blur = cancelInput.bind(this)

    targetElement.addEventListener('pointerdown', this.#mousedown)
    targetElement.addEventListener('pointerup', this.#mouseup)
    targetElement.addEventListener('pointermove', this.#mousemove)
    targetElement.addEventListener('pointercancel', this.#pointercancel)
    targetElement.addEventListener('lostpointercapture', this.#pointercancel)
    targetElement.addEventListener('wheel', this.#wheel, { passive: false })
    targetElement.addEventListener('contextmenu', this.#contextmenu)
    window.addEventListener('blur', this.#blur)
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

    if (this.keys.has('mouseright')) {
      const temp = Vector2.set(-this.moveSensitivity, -this.moveSensitivity)
      input.add(temp.multiply(delta))
    } else if (this.keys.has('mouseleft')) {

      this.azimuth += -delta.x * this.sensitivity
      this.elevation += delta.y * this.sensitivity
      this.elevation = clamp(this.elevation, this.minElevation, this.maxElevation)
    }


    Vector2.rotate(input, -this.azimuth, input)
    this.offset.x += input.x
    this.offset.z += input.y
    this.mouseDelta.set(0, 0)
  }

  update() {
    this.updateInput()
    this.updateOrbit()
  }

  dispose(){
    const targetElement = this.#targetElement
    targetElement.removeEventListener('pointerdown', this.#mousedown)
    targetElement.removeEventListener('pointerup', this.#mouseup)
    targetElement.removeEventListener('pointermove', this.#mousemove)
    targetElement.removeEventListener('pointercancel', this.#pointercancel)
    targetElement.removeEventListener('lostpointercapture', this.#pointercancel)
    targetElement.removeEventListener('wheel', this.#wheel)
    targetElement.removeEventListener('contextmenu', this.#contextmenu)
    window.removeEventListener('blur', this.#blur)
  }
}

/**
 * @this {OrbitCameraControls}
 * @param {PointerEvent} event
 */
function mouseDown(event) {
  event.preventDefault()
  this.mousePosition.set(event.clientX, event.clientY)
  this.mouseDelta.set(0, 0)
  if (event.currentTarget instanceof Element) {
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
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
 * @param {PointerEvent} event
 */
function mouseUp(event) {
  event.preventDefault()
  if (event.currentTarget instanceof Element) {
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }
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
 */
function cancelInput() {
  this.keys.clear()
  this.mouseDelta.set(0, 0)
}

/**
 * @this {OrbitCameraControls}
 * @param {PointerEvent} event
 */
function mousemove(event) {
  this.mouseDelta.copy(this.mousePosition)
  this.mousePosition.set(event.clientX, event.clientY)
  this.mouseDelta.subtract(this.mousePosition).reverse()
}

/**
 * @this {OrbitCameraControls}
 * @param {WheelEvent} event
 */
function mouseWheel(event) {
  event.preventDefault()
  this.distance *= Math.exp(event.deltaY * this.zoomSensitivity)
  this.distance = clamp(this.distance, this.minDistance, this.maxDistance)
}
