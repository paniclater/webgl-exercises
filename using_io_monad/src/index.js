const { IO } = require('monet');

const app = id =>
  IO(() => document.write(`<canvas id="${id}" height="600" width="600"></canvas>`))
  .map(() => document.getElementById(id))
  .bind(canvas =>
    IO(() => canvas.getContext('webgl'))
    .bind(gl =>
      IO(() => gl.viewport(0, 0, canvas.width, canvas.height))
      .map(() => gl.clearColor(1, 1, 0, 1))
      .map(() => gl.clear(gl.COLOR_BUFFER_BIT))))

app('canvas').run();
