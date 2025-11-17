import { BlendEquation, BlendMode } from "../../constants/index.js"

export class BlendParams {
  /**
   * @type {BlendEquation}
   */
  operation
  /**
   * @type {BlendMode}
   */
  source
  /**
   * @type {BlendMode}
   */
  destination

  /**
   * @param {BlendEquation} operation
   * @param {BlendMode} source
   * @param {BlendMode} destination
   */
  constructor(operation, source, destination) {
    this.operation = operation
    this.source = source
    this.destination = destination
  }

  clone() {
    return new BlendParams(
      this.operation,
      this.source,
      this.destination,
    )
  }

  static Opaque = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.Zero
  ))

  static AlphaBlend = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.SrcAlpha,
    BlendMode.OneMinusSrcAlpha,
  ))

  static PremultiplyAlpha = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.OneMinusSrcAlpha,
  ))

  static AdditiveAlpha = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.SrcAlpha,
    BlendMode.One,
  ))

  static AdditiveColor = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.One,
    BlendMode.One,
  ))

  static Multiply = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.DstColor,
    BlendMode.Zero,
  ))

  static Screen = Object.freeze(new BlendParams(
    BlendEquation.Add,
    BlendMode.OneMinusDstColor,
    BlendMode.One,
  ))

  static Min = Object.freeze(new BlendParams(
    BlendEquation.Min,
    BlendMode.One,
    BlendMode.One,
  ))

  static Max = Object.freeze(new BlendParams(
    BlendEquation.Max,
    BlendMode.One,
    BlendMode.One,
  ))
}