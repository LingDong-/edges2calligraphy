function loadJSON(filename,callback) {   
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);  
 }

function createContext(width, height, scale) {
  var canvas = document.createElement("canvas")
  canvas.width = width * scale
  canvas.height = height * scale
  var ctx = canvas.getContext("2d")
  ctx.scale(scale, scale)
  return ctx
}

function b64_to_bin(str) {
  var binstr = atob(str)
  var bin = new Uint8Array(binstr.length)
  for (var i = 0; i < binstr.length; i++) {
    bin[i] = binstr.charCodeAt(i)
  }
  return bin
}

function delay(fn) {
  setTimeout(fn, 0)
}

function default_format(obj) {
  if (typeof(obj) === "string") {
    return obj
  } else {
    return JSON.stringify(obj)
  }
}

function array_equal(a, b) {
  if (a.length != b.length) {
    return false
  }

  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false
    }
  }
  return true
}

function distance(p0,p1){
  return Math.sqrt(Math.pow(p0[0]-p1[0],2) + Math.pow(p0[1]-p1[1],2));
}

function rgba(v) {
  return fmt("rgba(%d, %d, %d, %f)", v[0] * 255, v[1] * 255, v[2] * 255, v[3])
}

function postProcess(ctx){
  
  var idataSrc = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  var dataSrc = idataSrc.data
  var len = dataSrc.length
  console.log(len)
  for(var i = 0; i < len; i += 4) {
    var luma = dataSrc[i] * 0.2126 + dataSrc[i+1] * 0.7152 + dataSrc[i+2] * 0.0722;

    var p = 0.7
    dataSrc[i] = dataSrc[i] * p + 200 * (1-p);
    dataSrc[i+1] = dataSrc[i+1] * p + 200 * (1-p);
    dataSrc[i+2] = dataSrc[i+2] * p + 180 * (1-p);
    dataSrc[i+3] = Math.min(Math.max((luma-100)*2+100,0),255);

    // var y = Math.floor((i/4)/SIZE)
    // var x = Math.floor((i/4)%SIZE)
    // var d = distance([x,y],[SIZE/2,SIZE])
    // if (d<20){
    //   dataSrc[i+3] *= (d/20)*(d/20);
    // }
  }
  ctx.putImageData(idataSrc, 0, 0);
}


var parse_color = function(c) {
    return [
        parseInt(c.substr(1,2), 16) / 255,
        parseInt(c.substr(3,2), 16) / 255,
        parseInt(c.substr(5,2), 16) / 255,
    parseInt(c.substr(7,2), 16) / 255,
    ]
}