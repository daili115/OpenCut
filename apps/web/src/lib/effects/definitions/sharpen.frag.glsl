precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_intensity;

void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution;
	float dx = 1.0 / u_resolution.x;
	float dy = 1.0 / u_resolution.y;

	vec4 center = texture2D(u_texture, uv);
	vec4 top = texture2D(u_texture, uv + vec2(0.0, dy));
	vec4 bottom = texture2D(u_texture, uv - vec2(0.0, dy));
	vec4 left = texture2D(u_texture, uv - vec2(dx, 0.0));
	vec4 right = texture2D(u_texture, uv + vec2(dx, 0.0));

	vec4 sharpened = center * 5.0 - (top + bottom + left + right);

	gl_FragColor = mix(center, sharpened, u_intensity);
}
