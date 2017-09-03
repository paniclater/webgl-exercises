const { IO } = require('monet');

//These are written in Open GL, a c like language for graphics
//Be very careful here, everything will run in javascript land if these are invalid
//But there will be a warning that it is an invalid program
const vsString = () => "void main(void) { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); gl_PointSize = 100.0; }";
const fsString = () => "void main(void) { gl_FragColor = vec4(0.25, 1.0, 0.5, 1.0); }";

const makeVertexShader =
  (gl, program) => () =>
    IO(() => vsString())
    .bind(vs =>
      IO(() => gl.createShader(gl.VERTEX_SHADER))
      .bind(vertexShader =>
        IO(() => gl.shaderSource(vertexShader, vs))
        .map(() => gl.compileShader(vertexShader))
        .map(() => gl.attachShader(program, vertexShader))));

const makeFragmentShader =
  (gl, program) => () =>
    IO(() => fsString())
    .bind(fs =>
      IO(() => gl.createShader(gl.FRAGMENT_SHADER))
      .bind(fragmentShader =>
        IO(() => gl.shaderSource(fragmentShader, fs))
        .map(() => gl.compileShader(fragmentShader))
        .map(() => gl.attachShader(program, fragmentShader))));

const app = id =>
  IO(() => document.write(`<canvas id="${id}" height="600" width="600"></canvas>`))
  .map(() => document.getElementById(id))
  .bind(canvas =>
    IO(() => canvas.getContext('webgl'))
    .bind(gl =>
      IO(() => gl.viewport(0, 0, canvas.width, canvas.height))
      .map(() => gl.createProgram())
      .bind(program =>
        IO(() => program)
        .bind(makeVertexShader(gl, program))
        .bind(makeFragmentShader(gl, program))
        .map(() => gl.linkProgram(program))
        .map(() => gl.useProgram(program))
        .map(() => gl.clearColor(1, 0, 1, 1))
        .map(() => gl.clear(gl.COLOR_BUFFER_BIT))
        .map(() => gl.drawArrays(gl.POINTS, 0,1))
      )));

app('canvas').run();
