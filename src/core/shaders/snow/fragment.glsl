precision highp float;

uniform sampler2D uTexture;

void main()
{
    vec4 tex = texture2D(uTexture, gl_PointCoord);

    if (tex.a < 0.1)
        discard;

    gl_FragColor = vec4(tex.rgb * 0.6, tex.a);
}