const vertexShaderSource = `
attribute vec4 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = a_position;
    v_texCoord = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float u_time;
uniform float u_scanlineThickness;
uniform float u_scanlinePeriod;
uniform float u_glitchAmplitude;

varying vec2 v_texCoord;

void main() {
    // 走査線のエフェクトを生成
    float scanline = sin(v_texCoord.y * u_scanlinePeriod + u_time * 8.0) * u_scanlineThickness;
    
    // グリッチエフェクトを適用
    vec3 color = vec3(0.2); // ここで色を指定
    color -= abs(sin(v_texCoord.y * 500.0 + u_time * 1.0)) * u_glitchAmplitude;
    color -= abs(sin(v_texCoord.y * 3500.0 - u_time * 1.0)) * u_glitchAmplitude;
    
    gl_FragColor = vec4(color, 0.2);
}
`;

// WebGLの初期化
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
console.error('Unable to initialize WebGL. Your browser may not support it.');
}

// シェーダーのコンパイルとリンク
function compileShader(gl, source, type) {
const shader = gl.createShader(type);
gl.shaderSource(shader, source);
gl.compileShader(shader);
if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}
return shader;
}

function linkProgram(gl, vertexShader, fragmentShader) {
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
}
return program;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = linkProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// uniform変数の場所を取得
const u_timeLocation = gl.getUniformLocation(program, 'u_time');
const u_scanlineThicknessLocation = gl.getUniformLocation(program, 'u_scanlineThickness');
const u_scanlinePeriodLocation = gl.getUniformLocation(program, 'u_scanlinePeriod');
const u_glitchAmplitudeLocation = gl.getUniformLocation(program, 'u_glitchAmplitude');

// uniform変数の初期値を設定
gl.uniform1f(u_scanlineThicknessLocation, 0.01); // 走査線の太さ
gl.uniform1f(u_glitchAmplitudeLocation, 0.05); // グリッチの振幅

// 頂点バッファの作成
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
-1, -1,
1, -1,
-1, 1,
1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// 頂点座標の取得
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// レンダリングループ開始
let then = 0;
function render(now) {
now *= 0.001; // 秒に変換
const deltaTime = now - then;
then = now;

// シェーダーの時間を更新
gl.uniform1f(u_timeLocation, now);

// 描画
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// 次のフレームをリクエスト
requestAnimationFrame(render);
}
requestAnimationFrame(render);
