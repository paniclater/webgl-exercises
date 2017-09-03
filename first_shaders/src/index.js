const { IO } = require('monet');

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
        IO(() => gl.createShader(gl.VERTEX_SHADER))
        .bind(vertexShader =>
          IO(() => gl.shaderSource(vertexShader, vs))
          .map(() => gl.compileShader(vertexShader))
          .map(() => fsString())
          .bind(fs =>
            IO(() => gl.createShader(gl.FRAGMENT_SHADER))
            .bind(fragmentShader =>
              IO(() => gl.shaderSource(fragmentShader, fs))
              .map(() => gl.compileShader(fragmentShader))
              .map(() => gl.createProgram())
              .bind(shaderProgram =>
                IO(() => gl.attachShader(shaderProgram, vertexShader))
                .map(() => gl.attachShader(shaderProgram, fragmentShader))
                .map(() => gl.linkProgram(shaderProgram))
                .map(() => gl.useProgram(shaderProgram))
                .map(() => gl.clearColor(1, 0, 1, 1))
                .map(() => gl.clear(gl.COLOR_BUFFER_BIT))
                .map(() => gl.drawArrays(gl.POINTS, 0, 1)))))))));

app('canvas').run();
