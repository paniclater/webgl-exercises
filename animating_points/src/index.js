const { IO } = require('monet');

const VERTEX_COUNT = 5000;
const ShaderTypes = {
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  VERTEX_SHADER: 'VERTEX_SHADER'
};

const vertexShaderString = () => document.getElementById('vertex-shader').text;
const fragmentShaderString = () => document.getElementById('fragment-shader').text;
const vertices = () => new Array(VERTEX_COUNT * 2).fill().map(_ => Math.random() * 2 - 1);

const initializeCanvasAndProgram  = id => {
  document.write(`<canvas id="${id}" height="600" width="600"></canvas>`)

  const canvas = document.getElementById(id);
  const gl = canvas.getContext('webgl');
  gl.viewport(0, 0, canvas.width, canvas.height);

  return { gl, program: gl.createProgram() };
};

const makeShader = (gl, program, shaderScript, type) => {
  const shader = gl.createShader(gl[type]);

  gl.shaderSource(shader, shaderScript);
  gl.compileShader(shader);
  gl.attachShader(program, shader);
};

const initializeBuffers = (gl, program, vertices) => {
  gl.linkProgram(program);
  gl.useProgram(program);

  const coords = gl.getAttribLocation(program, 'coords');

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.vertexAttribPointer(coords, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(coords);
  gl.vertexAttrib1f(gl.getAttribLocation(program, 'pointSize'), 5);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, 1);
};

const draw = (gl, vertices) => () => {
  const newVs = vertices.map(v => v + Math.random() * 0.01 - 0.005);

  gl.clearColor(1, 0, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(newVs))
  gl.drawArrays(gl.POINTS, 0, VERTEX_COUNT)

  requestAnimationFrame(draw(gl, newVs));
};

const app = id =>
  IO(() => {
    const { gl, program } = initializeCanvasAndProgram(id);
    const vs = vertices();

    makeShader(gl, program, vertexShaderString(), ShaderTypes.VERTEX_SHADER);
    makeShader(gl, program, fragmentShaderString(), ShaderTypes.FRAGMENT_SHADER);
    initializeBuffers(gl, program, vs);
    draw(gl, vs)();
  });

app('canvas').run();
