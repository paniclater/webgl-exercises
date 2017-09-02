console.log('setting up webgl');
let gl;

initGl();
draw();

function initGl() {
  const canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl');
  // set the viewport of the webl context
  //x of lower left corner, y of lower left corner, width and height
  //defaults to 0, 0, canvas width, canvas height, so this is not necessary unless the canvas will change size
  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1, 0, 0, 1); //r, g, b, opacity values
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT);
}


