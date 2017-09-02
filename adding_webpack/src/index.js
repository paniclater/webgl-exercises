document.write('<canvas id="canvas" height="600" width="600"></canvas>');
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

initGl(gl);
draw(gl);

function initGl(gl) {
  // set the viewport of the webl context
  //x of lower left corner, y of lower left corner, width and height
  //defaults to 0, 0, canvas width, canvas height, so this is not necessary unless the canvas will change size
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1, 0, 0, 1); //r, g, b, alpha values
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
}


