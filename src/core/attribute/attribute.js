import { GlDataType } from '../../constant.js'

export class Attribute {

  /**
   * @readonly
   * @type {string}
   */
  name = ''

  /**
   * @readonly
   * @type {number}
   */
  id = 0

  /**
   * @readonly
   * @type {GlDataType}
   */
  type = 0

  /**
   * @readonly
   * @type {number}
   */
  size = 0

  /**
   * @param {string} name
   * @param {number} location
   * @param {GlDataType} type
   * @param {number} size
   */
  constructor(name, location, type, size) {
    this.name = name
    this.id = location
    this.type = type
    this.size = size
  }

  static Position = new Attribute(
    'position',
    0,
    GlDataType.FLOAT,
    3
  )

  static UV = new Attribute(
    'uv',
    1,
    GlDataType.FLOAT,
    2
  )

  static UVB = new Attribute(
    'uvb',
    2,
    GlDataType.FLOAT,
    2
  )

  static Normal = new Attribute(
    'normal',
    3,
    GlDataType.FLOAT,
    3
  )

  static Tangent = new Attribute(
    'tangent',
    4,
    GlDataType.FLOAT,
    3
  )

  static Color = new Attribute(
    'color',
    5,
    GlDataType.FLOAT,
    4
  )
  static JointWeight = new Attribute(
    'joint_weight',
    6,
    GlDataType.FLOAT,
    1
  )
  static JointIndex = new Attribute(
    'joint_index',
    7,
    GlDataType.UNSIGNED_SHORT,
    1
  )
}