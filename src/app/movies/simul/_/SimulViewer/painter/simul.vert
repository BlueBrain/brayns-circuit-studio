#version 300 es

precision mediump float;

uniform float uniRadius;
uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
/**
 * Positon and voltage.
 */
in vec4 attPosition;
in float attVoltage;

out float varTint;


float clampOnRange(float value, float min, float max) {
    return clamp(
        (value - min) / (max - min),
        0.0,
        1.0
    );
}

void main() {
    varTint = clampOnRange(attVoltage, -80.0, 27.0);
    // varTint = clampOnRange(attVoltage, 0.0, 1.0);
    gl_Position = uniProjectionMatrix * uniModelViewMatrix * attPosition;

    vec4 posRadius = uniProjectionMatrix * (uniModelViewMatrix * attPosition + vec4(0, 1, 0, 0));
    float radius = abs(posRadius.y - gl_Position.y) / gl_Position.w;
    gl_PointSize = uniRadius * radius;
}
