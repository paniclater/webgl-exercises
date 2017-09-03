const { IO } = require('monet');

const VERTEX_COUNT = 5000;
//These are written in Open GL, a c like language for graphics
//Be very careful here, everything will run in javascript land if these are invalid
//But there will be a warning that it is an invalid program
const vsString = () => document.getElementById('vertex-shader').text;
const fsString = () => document.getElementById('fragment-shader').text;

const vertices = () => new Array(VERTEX_COUNT * 2).fill().map(_ => Math.random() * 2 - 1);
vertices();


//vertex shader handles point location and size
const makeVertexShader = (gl, program) => () =>
  IO(() => vsString())
  .bind(vs =>
    IO(() => gl.createShader(gl.VERTEX_SHADER))
    .bind(vertexShader =>
      IO(() => gl.shaderSource(vertexShader, vs))
      .map(() => gl.compileShader(vertexShader))
      .map(() => gl.attachShader(program, vertexShader))
  ));

//fragment shader handles color
const makeFragmentShader = (gl, program) => () =>
  IO(() => fsString())
  .bind(fs =>
    IO(() => gl.createShader(gl.FRAGMENT_SHADER))
    .bind(fragmentShader =>
      IO(() => gl.shaderSource(fragmentShader, fs))
      .map(() => gl.compileShader(fragmentShader))
      .map(() => gl.attachShader(program, fragmentShader))));

const configureArrayBuffer = gl => coords =>
  //bind the buffer
  IO(() => gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()))
  //use the coords attribute, three points, float values
  .map(() => gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0))
  //use the array buffer, send in our actual coords, use a static strategy to draw (very efficient, not dynamic)
  .map(() => gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices()), gl.STATIC_DRAW))
  //enable the array with our coords attribute
  .map(() => gl.enableVertexAttribArray(coords))
  //unbind the buffer
  .map(() => gl.bindBuffer(gl.ARRAY_BUFFER, null))

// must set attributes after program is linked
//must set uniform after program is in use
const initializeProgram = (gl, program) => () =>
  IO(() => gl.linkProgram(program))
  .map(() => gl.useProgram(program))
  .map(() => gl.getAttribLocation(program, 'coords'))
  .bind(configureArrayBuffer(gl))
  .map(() => gl.vertexAttrib1f(gl.getAttribLocation(program, 'pointSize'), 5))
  .map(() => gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, 1))

const draw = gl => () => IO(() => gl.clearColor(1, 0, 1, 1)) //sets the clear color
  .map(() => gl.clear(gl.COLOR_BUFFER_BIT)) //actually draws the clear color
//LINES draws lines for each complete vertex pair
//LINE_STRIP draws lines for each vertex without closing the loop
//LINE_LOOP draws lines for each vertex and closes the loop
//TRIANGLES makes a filled triangle
  .map(() => gl.drawArrays(gl.POINTS, 0, VERTEX_COUNT)) //

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
        .bind(initializeProgram(gl, program))
      )
      .bind(draw(gl))
    ));

app('canvas').run();
