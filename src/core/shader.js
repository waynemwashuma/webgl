export class Shader {
  
  /**
   * @readonly
   * @type {string}
   */
  source
  
  /**
   * @typedef {Map<string,string>}
   */
  defines

  /**
   * 
   * @param {ShaderModuleDescriptor} descriptor 
   */
  constructor({ source, defines = new Map() }) {
    this.source = source
    this.defines = defines
  }

  /**
   * @param {ReadonlyMap<string,string>} includes
   */
  compile(includes) {
    const {source, defines } = this
    return preprocessShader(source, includes, defines)
  }
}

/**
 * @typedef ShaderModuleDescriptor
 * @property {string} source
 * @property {Map<string,string>} [defines]
 */

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