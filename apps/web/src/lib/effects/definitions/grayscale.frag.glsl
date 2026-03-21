precision mediump float;

uniform sampler2D u_texture;
uniform float u_amount;

void main() {
	vec4 color = texture2D(u_texture, gl_FragCoord.xy / vec2(1920.0, 1080.0));
	float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
	vec4 grayscale = vec4(vec3(gray), color.a);
	gl_FragColor = mix(color, grayscale, u_amount);
}
