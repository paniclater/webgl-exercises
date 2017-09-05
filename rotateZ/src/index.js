const { IO } = require('monet');

const updateObject = (o1, o2) => Object.assign({}, o1, o2);
const StateMachine = {
  state: {
    angle: 0
  },
  getState: key => StateMachine.state[key],
  setState: newState => StateMachine.state = updateObject(StateMachine.state, newState)
};
const getRotationMatrices = (cos, sin) => ({
  X: new Float32Array([
    1, 0, 0, 0,
    0, cos, -sin, 0,
    0, sin, cos, 0,
    0, 0, 0, 1
  ]),
  Y: new Float32Array([
    cos, 0, sin, 0,
    0, 1, 0, 0,
    -sin, 0, cos, 0,
    0, 0, 0, 1
  ]),
  Z: new Float32Array([
    cos, -sin, 0, 0,
    sin, cos, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
});
const ShaderTypes = {
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  VERTEX_SHADER: 'VERTEX_SHADER'
};

const vertexShaderString = () => document.getElementById('vertex-shader').text;
const fragmentShaderString = () => document.getElementById('fragment-shader').text;

const rotate = (angle, gl, program, type) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'transformMatrix'), false, getRotationMatrices(cos, sin)[type]);
};

const initializeCanvasAndProgram  = id => {
  document.write(`<canvas id="${id}" style="position: absolute;" height="${window.innerHeight}" width="${window.innerWidth}"></canvas>`);

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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(coords, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coords);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.vertexAttrib1f(gl.getAttribLocation(program, "pointSize"), 20);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, .9);
};

const draw = (gl, program) => () => {
  StateMachine.setState({ angle: StateMachine.getState('angle') + 0.01 });
  rotate(StateMachine.getState('angle'), gl, program, 'Z');
  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  requestAnimationFrame(draw(gl, program));
};

const app = id =>
  IO(() => {
    const { gl, program } = initializeCanvasAndProgram(id);
    const vertices = [
        -0.9, -0.9, 0.0,
           0.9, -0.9, 0.0,
           0.0,  0.9, 0.0
      ];
    makeShader(gl, program, vertexShaderString(), ShaderTypes.VERTEX_SHADER);
    makeShader(gl, program, fragmentShaderString(), ShaderTypes.FRAGMENT_SHADER);
    initializeBuffers(gl, program, vertices);
    const style = "position: absolute; z-index: 100; font-family: sans-serif; font-size: 5em; font-weight: 900; width: 100%; text-align: center; color: pink;"
  document.write(`<div style="${style}">bogosorting</div>`);
    draw(gl, program)();
  });

app('canvas').run();
