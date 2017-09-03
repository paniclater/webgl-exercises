const { IO } = require('monet');

//These are written in Open GL, a c like language for graphics
//Be very careful here, everything will run in javascript land if these are invalid
//But there will be a warning that it is an invalid program
const vsString = () => "void main(void) { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); gl_PointSize = 10.0; }";
const fsString = () => "void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";

const app = id =>
  IO(() => document.write(`<canvas id="${id}" height="600" width="600"></canvas>`))
  .map(() => document.getElementById(id))
  .bind(canvas =>
    IO(() => canvas.getContext('webgl'))
    .bind(gl =>
      IO(() => gl.viewport(0, 0, canvas.width, canvas.height))
      .map(() => vsString())
      .bind(vs =>
        IO(() => gl.createShader(gl.VERTEX_SHADER)) //create the shader
        .bind(vertexShader =>
          IO(() => gl.shaderSource(vertexShader, vs)) //add the Open Gl string to the shader
          .map(() => gl.compileShader(vertexShader)) //compile it (vertex shader is points)
          .map(() => fsString())
          .bind(fs =>
            IO(() => gl.createShader(gl.FRAGMENT_SHADER)) //create the shader
            .bind(fragmentShader =>
              IO(() => gl.shaderSource(fragmentShader, fs)) //add the Open GL string to it
              .map(() => gl.compileShader(fragmentShader)) // compile it (fragment shader is colors)
              .map(() => gl.createProgram()) //create the program
              .bind(shaderProgram =>
                IO(() => gl.attachShader(shaderProgram, vertexShader)) //attach vertex & fragment shaders
                .map(() => gl.attachShader(shaderProgram, fragmentShader))
                .map(() => gl.linkProgram(shaderProgram)) //link it?
                .map(() => gl.useProgram(shaderProgram)) //use it?
                .map(() => gl.clearColor(1, 0, 1, 1))
                .map(() => gl.clear(gl.COLOR_BUFFER_BIT))
                .map(() => gl.drawArrays(gl.POINTS, 0, 1)))))))));

app('canvas').run();
