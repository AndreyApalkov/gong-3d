uniform float uTime;
uniform vec2 uResolution;

attribute float size;
attribute float speed;
attribute float offset;

void main()
{
    vec3 pos = position;

    // downward movement
    pos.y -= mod(uTime * speed + offset, pos.y);

    // horizontal drift and oscillations
    pos.x += sin(uTime * 0.5 + offset * 10.0) * 1.5;
    pos.z += cos(uTime * 0.4 + offset * 7.0) * 1.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * uResolution.y * (1.0 / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}