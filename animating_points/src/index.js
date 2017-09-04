const { IO } = require('monet');

const Impure = {
  vertexShaderString: () => document.getElementById('vertex-shader').text,
  fragmentShaderString: () => document.getElementById('fragment-shader').text,
};

const VERTEX_COUNT = 5000;

const ShaderTypes = {
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  VERTEX_SHADER: 'VERTEX_SHADER'
};

const Pure = {
  vertices: () => new Array(VERTEX_COUNT * 2).fill().map(_ => Math.random() * 2 - 1)
};

const makeShader = (gl, program, shaderScript, type) => IO(() => {
  const shader = gl.createShader(gl[type]);

  gl.shaderSource(shader, shaderScript);
  gl.compileShader(shader);
  gl.attachShader(program, shader);
});

const configureArrayBuffer = (gl, vertices) => coords =>
  //bind the buffer
  IO(() => {
    return gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  })
  //use the coords attribute, three points, float values
  .map(() => gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0))
  //use the array buffer, send in our actual coords, use a static strategy to draw (very efficient, not dynamic)
  .map(() => gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW))
  //enable the array with our coords attribute
  .map(() => gl.enableVertexAttribArray(coords))
  //unbind the buffer
//.map(() => gl.bindBuffer(gl.ARRAY_BUFFER, null))
  .map(() => vertices);

// must set attributes after program is linked
//must set uniform after program is in use
const initializeProgram = (gl, program) => vertices =>
  IO(() => gl.linkProgram(program))
  .map(() => gl.useProgram(program))
  .map(() => gl.getAttribLocation(program, 'coords'))
  .bind(configureArrayBuffer(gl, vertices))
  .map(() => gl.vertexAttrib1f(gl.getAttribLocation(program, 'pointSize'), 5))
  .map(() => gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, 1))
  .map(() => vertices);

const draw = (gl, vertices) => {
  return function () {
    const newVs = vertices.map(v => v + Math.random() * 0.01 - 0.005);
    gl.clearColor(1, 0, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(newVs))
    gl.drawArrays(gl.POINTS, 0, VERTEX_COUNT)

    requestAnimationFrame(draw(gl, newVs));
  };
};


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
        .bind(() => makeShader(gl, program, Impure.vertexShaderString(), ShaderTypes.VERTEX_SHADER))
        .bind(() => makeShader(gl, program, Impure.fragmentShaderString(), ShaderTypes.FRAGMENT_SHADER))
        .map(() => Pure.vertices())
        .bind(initializeProgram(gl, program))
        .bind(vs => {
          draw(gl, vs)();

          return IO(() => gl);
        })
    )));

app('canvas').run();
