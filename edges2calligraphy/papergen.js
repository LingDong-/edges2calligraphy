// Paper texture html background generation
// Lingdong Huang 2018

// math constants
var rad2deg = 180/Math.PI
var deg2rad = Math.PI/180
var PI = Math.PI
var sin = Math.sin
var cos = Math.cos
var abs = Math.abs
var pow = Math.pow
function rad(x){return x * deg2rad}
function deg(x){return x * rad2deg}

// seedable pseudo random number generator
var Prng = new function(){
  this.s = 1234
  this.p = 999979
  this.q = 999983
  this.m = this.p*this.q
  this.hash = function(x){
    var y = window.btoa(JSON.stringify(x)); var z = 0
    for (var i = 0; i < y.length; i++){
      z += y.charCodeAt(i)*Math.pow(128,i)}
    return z
  }
  this.seed = function(x){
    if (x == undefined) {x = (new Date()).getTime()}
    var y = 0; var z = 0;
    function redo(){y = (Prng.hash(x)+z) % Prng.m; z+=1}
    while (y % Prng.p == 0 || y % Prng.q == 0 || y == 0 || y == 1){redo()}
    Prng.s = y
    console.log(["int seed",Prng.s])
    for (var i = 0; i < 10; i++){Prng.next();}
  }
  this.next = function(){
    Prng.s = (Prng.s * Prng.s) % Prng.m
    return Prng.s/Prng.m
  }
  this.test = function(f){
    var F = f || function() {return Prng.next()}
    var t0 = (new Date()).getTime()
    var chart = [0,0,0,0,0, 0,0,0,0,0]
    for (var i = 0; i < 10000000; i++){
      chart[Math.floor(F()*10)] += 1}
    console.log(chart)
    console.log("finished in "+((new Date()).getTime()-t0))
    return chart;
  }
}
Math.oldRandom = Math.random
Math.random = function(){return Prng.next()}
Math.seed = function(x){return Prng.seed(x)}

// parse url arguments
function parseArgs(key2f){
  var par = window.location.href.split("?")[1]
  if (par == undefined){return}
  par = par.split("&")
  for (var i = 0; i < par.length; i++){
    var e = par[i].split("=")
    try{
      key2f[e[0]](e[1])
    }catch(e){
      console.log(e)
    }
  }
}
SEED = (""+(new Date()).getTime())
parseArgs({seed:function(x){SEED = (x==""?SEED:x)}})
Math.seed(SEED);
console.log(SEED)


//perlin noise adapted from p5.js
var Noise = new function(){
  var PERLIN_YWRAPB = 4; var PERLIN_YWRAP = 1<<PERLIN_YWRAPB;
  var PERLIN_ZWRAPB = 8; var PERLIN_ZWRAP = 1<<PERLIN_ZWRAPB;
  var PERLIN_SIZE = 4095;
  var perlin_octaves = 4;var perlin_amp_falloff = 0.5;
  var scaled_cosine = function(i) {return 0.5*(1.0-Math.cos(i*Math.PI));};
  var perlin;
  this.noise = function(x,y,z) {
    y = y || 0; z = z || 0;
    if (perlin == null) {
      perlin = new Array(PERLIN_SIZE + 1);
      for (var i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = Math.random();
      }
    }
    if (x<0) { x=-x; } if (y<0) { y=-y; } if (z<0) { z=-z; }
    var xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
    var xf = x - xi; var yf = y - yi; var zf = z - zi;
    var rxf, ryf;
    var r=0; var ampl=0.5;
    var n1,n2,n3;
    for (var o=0; o<perlin_octaves; o++) {
      var of=xi+(yi<<PERLIN_YWRAPB)+(zi<<PERLIN_ZWRAPB);
      rxf = scaled_cosine(xf); ryf = scaled_cosine(yf);
      n1  = perlin[of&PERLIN_SIZE];
      n1 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n1);
      n2  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
      n2 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n2);
      n1 += ryf*(n2-n1);
      of += PERLIN_ZWRAP;
      n2  = perlin[of&PERLIN_SIZE];
      n2 += rxf*(perlin[(of+1)&PERLIN_SIZE]-n2);
      n3  = perlin[(of+PERLIN_YWRAP)&PERLIN_SIZE];
      n3 += rxf*(perlin[(of+PERLIN_YWRAP+1)&PERLIN_SIZE]-n3);
      n2 += ryf*(n3-n2);
      n1 += scaled_cosine(zf)*(n2-n1);
      r += n1*ampl;
      ampl *= perlin_amp_falloff;
      xi<<=1; xf*=2; yi<<=1; yf*=2; zi<<=1; zf*=2;
      if (xf>=1.0) { xi++; xf--; }
      if (yf>=1.0) { yi++; yf--; }
      if (zf>=1.0) { zi++; zf--; }
    }
    return r;
  };
  this.noiseDetail = function(lod, falloff) {
    if (lod>0)     { perlin_octaves=lod; }
    if (falloff>0) { perlin_amp_falloff=falloff; }
  };
  this.noiseSeed = function(seed) {
    var lcg = (function() {
      var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
      return {
        setSeed : function(val) {
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed : function() {return seed;},
        rand : function() { z = (a * z + c) % m; return z / m;}
      };
    }());
    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (var i = 0; i < PERLIN_SIZE + 1; i++) {perlin[i] = lcg.rand();}
  };
}
// distance between 2 coordinates in 2D
function distance(p0,p1){
  return Math.sqrt(Math.pow(p0[0]-p1[0],2) + Math.pow(p0[1]-p1[1],2));
}
// map float from one range to another
function mapval(value,istart,istop,ostart,ostop){
    return ostart + (ostop - ostart) * ((value - istart)*1.0 / (istop - istart))
}
// random element from array
function randChoice(arr) {
  return arr[Math.floor(arr.length * Math.random())];
}
// normalized random number
function normRand(m,M){
  return mapval(Math.random(),0,1,m,M);
}
// weighted randomness
function wtrand(func){
  var x = Math.random()
  var y = Math.random()
  if (y<func(x)){
    return x
  }else{
    return wtrand(func)
  }
}
// gaussian randomness
function randGaussian(){
  return wtrand(function(x){return Math.pow(Math.E,-24*Math.pow(x-0.5,2))})*2-1
}
// sigmoid curve
function sigmoid(x,k){
  k = (k != undefined) ? k : 10
  return 1/(1+Math.exp(-k*(x-0.5)))
}
// pseudo bean curve
function bean(x){
  return pow(0.25-pow(x-0.5,2),0.5)*(2.6+2.4*pow(x,1.5))*0.54
}
// interpolate between square and circle
var squircle = function(r,a){
  return function(th){
    while (th > PI/2){
      th -= PI/2
    }
    while (th < 0){
      th += PI/2
    }
    return r*pow(1/(pow(cos(th),a)+pow(sin(th),a)),1/a)
  }
}
// mid-point of an array of points
function midPt(){
  var plist = (arguments.length == 1) ? 
    arguments[0] : Array.apply(null, arguments)
  return plist.reduce(function(acc,v){
    return [v[0]/plist.length+acc[0],
            v[1]/plist.length+acc[1],
            v[2]/plist.length+acc[2]]
  },[0,0,0])
}
// rational bezier curve
function bezmh(P, w){
  w = (w == undefined) ? 1 : w
  if (P.length == 2){
    P = [P[0],midPt(P[0],P[1]),P[1]];
  }
  var plist = [];
  for (var j = 0; j < P.length-2; j++){
    var p0; var p1; var p2;
    if (j == 0){p0 = P[j];}else{p0 = midPt(P[j],P[j+1]);}
    p1 = P[j+1];
    if (j == P.length-3){p2 = P[j+2];}else{p2 = midPt(P[j+1],P[j+2]);}
    var pl = 20;
    for (var i = 0; i < pl+(j==P.length-3); i+= 1){
      var t = i/pl;
      var u = (Math.pow (1 - t, 2) + 2 * t * (1 - t) * w + t * t);
      plist.push([
        (Math.pow(1-t,2)*p0[0]+2*t*(1-t)*p1[0]*w+t*t*p2[0])/u,
        (Math.pow(1-t,2)*p0[1]+2*t*(1-t)*p1[1]*w+t*t*p2[1])/u,
        (Math.pow(1-t,2)*p0[2]+2*t*(1-t)*p1[2]*w+t*t*p2[2])/u]);
    }
  }
  return plist;
}

// rgba to css color string
function rgba(r,g,b,a){
  r = (r != undefined) ? r:255;
  g = (g != undefined) ? g:r;
  b = (b != undefined) ? b:g;
  a = (a != undefined) ? a:1.0;
  return "rgba("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+","+a.toFixed(3)+")"
}
// hsv to css color string
function hsv(h,s,v,a){
    var c = v*s
    var x = c*(1-abs((h/60)%2-1))
    var m = v-c
    var [rv,gv,bv] = ([[c,x,0],[x,c,0],[0,c,x],
                       [0,x,c],[x,0,c],[c,0,x]])[Math.floor(h/60)]
    var [r,g,b] = [(rv+m)*255,(gv+m)*255,(bv+m)*255]
    return rgba(r,g,b,a)
}
// polygon for HTML canvas
function polygon(args){
  var args =(args != undefined) ? args : {};
  var ctx = (args.ctx != undefined) ? args.ctx : CTX;
  var xof = (args.xof != undefined) ? args.xof : 0;  
  var yof = (args.yof != undefined) ? args.yof : 0;  
  var pts = (args.pts != undefined) ? args.pts : [];
  var col = (args.col != undefined) ? args.col : "black";
  var fil = (args.fil != undefined) ? args.fil : true;
  var str = (args.str != undefined) ? args.str : !fil;

  ctx.beginPath();
  if (pts.length > 0){
    ctx.moveTo(pts[0][0]+xof,pts[0][1]+yof);
  }
  for (var i = 1; i < pts.length; i++){
    ctx.lineTo(pts[i][0]+xof,pts[i][1]+yof);
  }
  if (fil){
    ctx.fillStyle = col;
    ctx.fill();
  }
  if (str){
    ctx.strokeStyle = col;
    ctx.stroke();
  }
}
// lerp hue wrapping around 360 degs
function lerpHue(h0,h1,p){
  var methods = [
    [abs(h1-h0),     mapval(p,0,1,h0,h1)],
    [abs(h1+360-h0), mapval(p,0,1,h0,h1+360)],
    [abs(h1-360-h0), mapval(p,0,1,h0,h1-360)]
   ]
  methods.sort((x,y)=>(x[0]-y[0]))
  return (methods[0][1]+720)%360
}

// generate 2d tube shape from list of points
function tubify(args){
  var args = (args != undefined) ? args : {};
  var pts = (args.pts != undefined) ? args.pts : [];
  var wid = (args.wid != undefined) ? args.wid : (x)=>(10);
  vtxlist0 = []
  vtxlist1 = []
  vtxlist = []
  for (var i = 1; i < pts.length-1; i++){
    var w = wid(i/pts.length)
    var a1 = Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0]);
    var a2 = Math.atan2(pts[i][1]-pts[i+1][1],pts[i][0]-pts[i+1][0]);
    var a = (a1+a2)/2;
    if (a < a2){a+=PI}
    vtxlist0.push([pts[i][0]+w*cos(a),(pts[i][1]+w*sin(a))]);
    vtxlist1.push([pts[i][0]-w*cos(a),(pts[i][1]-w*sin(a))]);
  }
  var l = pts.length-1
  var a0 = Math.atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0]) - Math.PI/2;
  var a1 = Math.atan2(pts[l][1]-pts[l-1][1],pts[l][0]-pts[l-1][0]) - Math.PI/2;
  var w0 = wid(0)
  var w1 = wid(1)
  vtxlist0.unshift([pts[0][0]+w0*Math.cos(a0),(pts[0][1]+w0*Math.sin(a0))])
  vtxlist1.unshift([pts[0][0]-w0*Math.cos(a0),(pts[0][1]-w0*Math.sin(a0))])
  vtxlist0.push([pts[l][0]+w1*Math.cos(a1),(pts[l][1]+w1*Math.sin(a1))])
  vtxlist1.push([pts[l][0]-w1*Math.cos(a1),(pts[l][1]-w1*Math.sin(a1))])
  return [vtxlist0,vtxlist1]
}
// line work with weight function
function stroke(args){
  var args = (args != undefined) ? args : {};
  var pts = (args.pts != undefined) ? args.pts : [];
  var ctx = (args.ctx != undefined) ? args.ctx : CTX;
  var xof = (args.xof != undefined) ? args.xof : 0;
  var yof = (args.yof != undefined) ? args.yof : 0;
  var col = (args.col != undefined) ? args.col : "black";
  var wid = (args.wid != undefined) ? args.wid :
    (x)=>(1*sin(x*PI)*mapval(Noise.noise(x*10),0,1,0.5,1));

  var [vtxlist0,vtxlist1] = tubify({pts:pts,wid:wid})

  polygon({pts:vtxlist0.concat(vtxlist1.reverse()),
    ctx:ctx,fil:true,col:col,xof:xof,yof:yof})
  return [vtxlist0,vtxlist1]
}
// generate paper texture
function paper(args){
  var args =(args != undefined) ? args : {};
  var col = (args.col != undefined) ? args.col : [0.98,0.91,0.74];
  var tex = (args.tex != undefined) ? args.tex : 20;
  var spr = (args.spr != undefined) ? args.spr : 1;

  var canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  var ctx = canvas.getContext("2d");
  var reso = 512
  for (var i = 0; i < reso/2+1; i++){
    for (var j = 0; j < reso/2+1; j++){
      var c = (255-Noise.noise(i*0.1,j*0.1)*tex*0.5)
      c -= Math.random()*tex;
      var r = (c*col[0])
      var g = (c*col[1])
      var b = (c*col[2])
      if (Noise.noise(i*0.04,j*0.04,2)*Math.random()*spr>0.7 
       || Math.random()<0.005*spr){
        var r = (c*0.7)
        var g = (c*0.5)
        var b = (c*0.2)
      }
      ctx.fillStyle = rgba(r,g,b);
      ctx.fillRect(i,j,1,1);
      ctx.fillRect(reso-i,j,1,1);
      ctx.fillRect(i,reso-j,1,1);
      ctx.fillRect(reso-i,reso-j,1,1);
    }
  }
  return canvas
}

// collection of image filters
var Filter = new function(){
  this.wispy = function(x,y,r,g,b,a){
    var n = Noise.noise(x*0.2,y*0.2)
    var m = Noise.noise(x*0.5,y*0.5,2)
    return [r,g*mapval(m,0,1,0.95,1),b*mapval(m,0,1,0.9,1),a*mapval(n,0,1,0.5,1)]
  }
  this.fade = function(x,y,r,g,b,a){
    var n = Noise.noise(x*0.01,y*0.01)
    return [r,g,b,a*Math.min(Math.max(mapval(n,0,1,0,1),0),1)]
  }
}

// canvas context operations
var Layer = new function(){
  this.empty = function(w,h){
    w = (w != undefined) ? w : 600;
    h = (h != undefined) ? h : w;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    context = canvas.getContext('2d');
    return context
  }
  this.blit = function(ctx0,ctx1,args){
    var args =(args != undefined) ? args : {};
    var ble = (args.ble != undefined) ? args.ble : "normal";  
    var xof = (args.xof != undefined) ? args.xof : 0;  
    var yof = (args.yof != undefined) ? args.yof : 0;  
    ctx0.globalCompositeOperation = ble;
    ctx0.drawImage(ctx1.canvas,xof,yof)
  }
  this.filter = function(ctx,f){
    var imgd = ctx.getImageData(0, 0, 
      ctx.canvas.width, ctx.canvas.height);
    var pix = imgd.data;
    for (var i = 0, n = pix.length; i < n; i += 4) {
      var [r,g,b,a] = pix.slice(i,i+4)
      var x = (i/4)%(ctx.canvas.width)
      var y = Math.floor((i/4)/(ctx.canvas.width))
      var [r1,g1,b1,a1] = f(x,y,r,g,b,a)
        pix[i  ] = r1
        pix[i+1] = g1
        pix[i+2] = b1
        pix[i+3] = a1
    }
    ctx.putImageData(imgd, 0, 0);
  }
  this.border = function(ctx,f){
    var imgd = ctx.getImageData(0, 0, 
      ctx.canvas.width, ctx.canvas.height);
    var pix = imgd.data;
    for (var i = 0, n = pix.length; i < n; i += 4) {
      var [r,g,b,a] = pix.slice(i,i+4)
      var x = (i/4)%(ctx.canvas.width)
      var y = Math.floor((i/4)/(ctx.canvas.width))

      var nx = (x/ctx.canvas.width-0.5)*2
      var ny = (y/ctx.canvas.height-0.5)*2
      var theta = Math.atan2(ny,nx)
      var r_ = distance([nx,ny],[0,0])
      var rr_ = f(theta)

      if (r_ > rr_){
        pix[i  ] = 0
        pix[i+1] = 0
        pix[i+2] = 0
        pix[i+3] = 0
      }
    }
    ctx.putImageData(imgd, 0, 0);
  }
  // find the dirty region - potentially optimizable
  this.bound = function(ctx){
    var xmin = ctx.canvas.width
    var xmax = 0
    var ymin = ctx.canvas.height
    var ymax = 0
    var imgd = ctx.getImageData(0, 0, 
      ctx.canvas.width, ctx.canvas.height);
    var pix = imgd.data;
    for (var i = 0, n = pix.length; i < n; i += 4) {
      var [r,g,b,a] = pix.slice(i,i+4)
      var x = (i/4)%(ctx.canvas.width)
      var y = Math.floor((i/4)/(ctx.canvas.width))
      if (a > 0.001){
        if (x < xmin){xmin = x}
        if (x > xmax){xmax = x}
        if (y < ymin){ymin = y}
        if (y > ymax){ymax = y}
      }
    }
    return {xmin:xmin,xmax:xmax,ymin:ymin,ymax:ymax}
  }
}

var BGCANV;

// download generated image
function makeDownload(){
  var down = document.createElement('a')
  down.innerHTML = "[Download]"
  down.addEventListener('click', function() {
    var ctx = Layer.empty(512)
    for (var i = 0; i < ctx.canvas.width; i+= 512){
      for (var j = 0; j < ctx.canvas.height; j+= 512){
        ctx.drawImage(BGCANV,i,j);
      }
    }
    this.href = ctx.canvas.toDataURL();
    this.download = SEED;
  }, false);
  document.body.appendChild(down);
  down.click()
  document.body.removeChild(down);
}


// fill HTML background with paper texture
function makeBG(args){
  setTimeout(_makeBG,10)
  function _makeBG(){
    BGCANV = paper(args)
    var img = BGCANV.toDataURL("image/png");
    document.body.style.backgroundImage = 'url('+img+')';
  }
}

// reload page with given seed
function reloadWSeed(s){
  var u = window.location.href.split("?")[0]
  window.location.href = u + "?seed=" + s;
}

// initialize everything
function load(){
  makeBG()
}



