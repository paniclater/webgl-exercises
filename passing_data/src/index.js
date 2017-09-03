const { IO } = require('monet');

//These are written in Open GL, a c like language for graphics
//Be very careful here, everything will run in javascript land if these are invalid
//But there will be a warning that it is an invalid program
const vsString = () => "attribute vec4 coords; attribute float pointSize; void main(void) { gl_Position = coords; gl_PointSize = pointSize; }";
const fsString = () => "precision mediump float; uniform vec4 color; void main(void) { gl_FragColor = color; }";

const makeVertexShader =
  (gl, program) => () =>
    IO(() => vsString())
    .bind(vs =>
      IO(() => gl.createShader(gl.VERTEX_SHADER))
      .bind(vertexShader =>
        IO(() => gl.shaderSource(vertexShader, vs))
        .map(() => gl.compileShader(vertexShader))
        .map(() => gl.attachShader(program, vertexShader))
      ));

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
        // must set attributes after program is linked
        .map(() => gl.vertexAttrib3f(gl.getAttribLocation(program, 'coords'), -0.5, -0.5, 0))
        .map(() => gl.vertexAttrib1f(gl.getAttribLocation(program, 'pointSize'), 1000))
        .map(() => gl.useProgram(program))
        //must set uniform after program is in use
        .map(() => gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, 1))
        .map(() => gl.clearColor(1, 0, 1, 1))
        .map(() => gl.clear(gl.COLOR_BUFFER_BIT))
        .map(() => gl.drawArrays(gl.POINTS, 0,1))
      )));

app('canvas').run();
