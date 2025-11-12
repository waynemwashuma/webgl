export const mathShaderLib = `
  // constants
  const float PI = 3.14159265359;

  // functions
  float sq(float x) {
    return x * x;
  }
  
  // https://learnopengl.com/Advanced-OpenGL/Depth-testing
  float linearize_depth(float depth, float near, float far){
    float ndc = depth * 2.0 - 1.0;
    return (2.0 * near * far) / (far + near - ndc * (far - near));
  }
`