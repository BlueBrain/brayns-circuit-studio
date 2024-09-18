#version 300 es

precision mediump float;

uniform sampler2D uniTexture;

in float varTint;
out vec4 FragColor;


void main() {
    vec2 p = (gl_PointCoord * 2.0) - vec2(1, 1);
    float r = length(p);
    if (r > 1.0) discard;
    else {
        vec3 color = texture(uniTexture, vec2(varTint)).rgb;
        float light = (1.0 - r) + 0.7;
        FragColor = vec4(color * light, 1.0);
    }
}
