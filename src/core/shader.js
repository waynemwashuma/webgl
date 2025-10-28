export class Shader {

  /**
   * @readonly
   * @type {string}
   */
  source

  /**
   * @typedef {Map<string,string>}
   */
  defines = new Map()

  /**
   * @type {Map<string,string>}
   */
  includes = new Map()
  /**
   * @param {ShaderModuleDescriptor} descriptor 
   */
  constructor({ source }) {
    this.source = source
  }

  /**
   * @returns {string}
   */
  compile() {
    const { source, defines, includes } = this
    return preprocessShader(source, includes, defines)
  }
}

/**
 * @typedef ShaderModuleDescriptor
 * @property {string} source
 * @property {Map<string,string>} [defines]
 */

// TODO: Maybe add error as a return type when something unexpected happens
// e.g when an include in the shader does not exist.
/**
 * @param {string} source
 * @param {ReadonlyMap<string,string>} includes 
 * @param {ReadonlyMap<string,string>} defines
 * @returns {string}
 */
function preprocessShader(source, includes, defines) {
  const version = "#version 300 es\n"
  const mergedDefines = [...defines.entries()]
    .map(([name, value]) => `#define ${name} ${value}`)
    .join("\n")
  const preprocessed = source.replace(/#include <(.*?)>/g, (_, name) => {
    const include = includes.get(name)
    if (!include) {
      console.error(`Could not find the include "${name}"`)
    }
    return include || ""
  })
  return version + mergedDefines + preprocessed
}