export const commonShaderLib = `
  // structs
  struct Camera {
    mat4 view;
    mat4 projection;
    vec3 cam_position;
    float near;
    float far;
  };
  
  // functions
  vec3 tint(vec3 tex_color, vec3 tint_color){
    return tex_color * tint_color;
  }

  mat4 get_value_from_texture(uint index, sampler2D transforms) {
		uint size = uint(textureSize( transforms, 0 ).x);
		uint stride = index * uint(4);
		uint x = stride % size;
		uint y = stride / size;
		vec4 column1 = texelFetch( transforms, ivec2( x, y ), 0 );
		vec4 column2 = texelFetch( transforms, ivec2( x + uint(1), y ), 0 );
		vec4 column3 = texelFetch( transforms, ivec2( x + uint(2), y ), 0 );
		vec4 column4 = texelFetch( transforms, ivec2( x + uint(3), y ), 0 );

		return mat4( column1, column2, column3, column4 );
	}
`