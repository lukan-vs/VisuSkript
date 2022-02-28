const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// gets the slot at x y coords from a flatten pixel matrix represented as 32bits
function getPixelColor32(data, x, y, width) {
  return data[y * width + x];
}
// set the value of the slots at x, y (32bits version)
function setPixelColor32(val, data, x, y, width) {
  data[y * width + x] = val;
}
// the same functions
// in case you wish to keep the orignal Uint8ClampedArray from ImageData
// returns a new Uint8ClampedArray, not that good for memory
function getPixelColor8(data, x, y, width) {
  const index = (y * width + x) * 4;
  return data.slice(index, index + 4);
}
// here vals is an Array like object of length 4 [r, g, b, a]
function setPixelColor8(vals, data, x, y, width) {
  const index = (y * width + x) * 4;
  for(let i = 0; i < 4; i ++) {
    data[index + i] = vals[i];
  }
}

// so we can draw a circle
function distanceFromCenter(x, y, cx, cy) {
  return Math.hypot(cx - x, cy - y);
}

let mouse_down = false;
canvas.onmousedown = (evt) => {
  mouse_down = true;
  draw(evt);
};
canvas.onmousemove = (evt) => {
  if(mouse_down) {
    draw(evt);
  }
};
canvas.onmouseup = (evt) => {
  mouse_down = false;
}
function draw(evt) {
  const { width, height } = canvas;
  const rad = height / 10;
  const cx = evt.offsetX;
  const cy = evt.offsetY;

  // we call getImageData only once
  const imgData = ctx.getImageData(0, 0, width, height);
  // using an Uint32Array view for easier pixel manipulation
  // we could obviously also use the Uint8Clamped version,
  // though it would use more memory
  const data = new Uint32Array(imgData.data.buffer);

  for( let x = 0; x < width; x ++) {
    for( let y = 0; y < height; y ++) {
      // make a circle
      if(distanceFromCenter(x, y, cx, cy) < rad + 1) {
        // get the pixel value (here as 32bit)
        const px = getPixelColor32(data, x, y, width);
        // do something with it (negative)
        setPixelColor32(~px | 0xFF000000, data, x, y, width);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

// just to draw something at beginning
const px_size = 10;
const noise = new ImageData(canvas.width / px_size, canvas.height / px_size);
new Uint32Array(noise.data.buffer)
  .forEach((v, i, a) => {
    a[i] = Math.random() * 0xFFFFFF + 0xFF000000;
  });
ctx.putImageData(noise, 0 ,0);
ctx.scale(px_size, px_size);
ctx.imageSmoothingEnabled = false;
ctx.drawImage(canvas, 0, 0);
ctx.setTransform(1,0,0,1,0,0);
ctx.imageSmoothingEnabled = true;