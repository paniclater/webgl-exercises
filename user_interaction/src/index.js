const { IO } = require('monet');

const updateObject = (o1, o2) => Object.assign({}, o1, o2);
const map = (value, minSrc, maxSrc, minDst, maxDst) => (value - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
const StateMachine = {
  state: {
    x: 1000,
    y: 1000
  },
  getState: key => StateMachine.state[key],
  setState: newState => StateMachine.state = updateObject(StateMachine.state, newState)
};

const VERTEX_COUNT = 5000;
const ShaderTypes = {
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  VERTEX_SHADER: 'VERTEX_SHADER'
};

const vertexShaderString = () => document.getElementById('vertex-shader').text;
const fragmentShaderString = () => document.getElementById('fragment-shader').text;
const vertices = () => new Array(VERTEX_COUNT).fill().map(_ => [Math.random() * 2 - 1, Math.random() * 5 + 1]);
const xAndYs = arr => arr.reduce((a, b, i) => ({
  x: b % 2 === 0 ? a.x.concat([b]) : a.x,
  y: b % 2 !== 0 ? a.y.concat([b]) : a.y
}), { x: [], y: [] });
const pairs = arr => arr.reduce((a, b, i) => {
  if (i === 0) return [[b]];
  if (i === 1) return [[...a[0], b]];
  if (i % 2 === 0) return [...a, [b]]
  return [...a.slice(0, a.length - 1), [...a[a.length - 1], b]];
}, []);
const flatten = arr => arr.reduce((a, b) => {
  return [...a, ...b];
}, []);

const initializeCanvasAndProgram  = id => {
  document.write(`<canvas id="${id}" style="position: absolute;" height="${window.innerHeight}" width="${window.innerWidth}"></canvas>`);

  const canvas = document.getElementById(id);
  canvas.addEventListener('mousemove', event => {
    StateMachine.setState({
      x: map(event.clientX, 0, canvas.width, -1, 1),
      y: map(event.clientY, 0, canvas.height, 1, -1)
    });
  });
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(vertices)), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(coords);
  gl.vertexAttrib1f(gl.getAttribLocation(program, 'pointSize'), 5);
  gl.uniform4f(gl.getUniformLocation(program, 'color'), .25, 1, .75, .9);
};

const draw = (gl, vertices) => () => {
  const newVs = vertices.map(arr => {
    const x = arr[0];
    const y = arr[1];

    if ( x < -1 || x > 1 || y < -1 || y > 1.2) {
      return [Math.random() * 2 - 1, Math.random() * .5 + 1];
    }

    const dx = x - StateMachine.getState('x');
    const dy = y - StateMachine.getState('y');
    const dist = Math.sqrt(dx * dx + dy * dy);
    const velocity = y >= 0 ?
      (Math.abs(y - 1.5) + 0.01) * 0.03 :
      (Math.abs(y) + 1) * 0.03
    if (dist < .9) {
      return [
        x + Math.random() * 0.01 - 0.005,
        y + .02
      ];
    }

    return [
      x + Math.random() * 0.01 - 0.005,
      y - velocity
    ];
  });

  gl.clearColor(1, 0, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(flatten(newVs)));
  gl.drawArrays(gl.POINTS, 0, VERTEX_COUNT);

  requestAnimationFrame(draw(gl, newVs));
};

const app = id =>
  IO(() => {
    const { gl, program } = initializeCanvasAndProgram(id);
    const vs = vertices();

    makeShader(gl, program, vertexShaderString(), ShaderTypes.VERTEX_SHADER);
    makeShader(gl, program, fragmentShaderString(), ShaderTypes.FRAGMENT_SHADER);
    initializeBuffers(gl, program, vs);
    const style = "position: absolute; z-index: 100; font-family: sans-serif; font-size: 5em; font-weight: 900; width: 100%; text-align: center; color: pink;"
  document.write(`<div style="${style}">bogosorting</div>`);
    draw(gl, vs)();
  });

app('canvas').run();
