uniform vec3 color;

const float PRECISION = 3.0;

void main() {
  float x = step(mod(gl_FragCoord.x, PRECISION), 1.0);
  float y = step(mod(gl_FragCoord.y, PRECISION), 1.0);
  if (x * y == 0.0) discard;
  gl_FragColor = vec4(color, 1.0);
}
