uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;
varying float vDisplacement;

void main() {
    float distort = 2.0 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time);

    vec2 c = abs(vUv - 0.5) * 2.0  * (1.0 - distort);
    vec2 m = mix(vec2(u_color.x, u_color.z), c, 1.0);

    vec3 color = vec3(m.x, 1.0, m.y);

    gl_FragColor = vec4(color, 1.0);
}