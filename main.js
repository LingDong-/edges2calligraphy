var DEBUG = false
var SIZE = 256
var SCALE = 1
var WEIGHTS_PATH = "./models/ziang_BtoA.pict"

cells = []
examples = []
LOCK = undefined
table = undefined;
COLinput = "#000000"
COLdisplay = "#CCCCCC"
mouseX = -1
mouseY = -1
ckbx_download = false;
ckbx_new = false;


CTX_CACHE = undefined

texts = {
  "Help": ()=>(`
    <img src='images/steps.svg' width='500' style='opacity: 0.7'></img>
    <ol>
      <li>Draw in any cell with your mouse, or click <i class='material-icons'>style</i> to load up a random example.</li>
      <li>Click <b>DONE</b> to compile your scribble into calligraphy.</li>
      <li>Click <i class='material-icons'>replay</i> to return to editor view. Click <i class='material-icons'>clear</i> to clear the cell.</li>
      <li>The canvas is infinite! Just scroll in any direction.</li>
    </ol>
    `),
  "About": ()=>(`
    <table><tr>
      <td align="center" style="font-size: 10px; color : rgba(255,255,255,0.7)">
        <img src='images/zhao.svg' height='150' style='opacity: 0.7'></img>
        <i>Zhao Mengfu, Scholar, Painter and Calligrapher, 1254–1322</i>
      </td>
      <td style = "
        ;color : rgba(255,255,255,0.7)
        ;padding-left : 20px
      ">
        <p>
          This project uses a neural network called <a href='https://arxiv.org/pdf/1611.07004.pdf'>pix2pix</a> 
          to transfer your scribbles into Chinese Calligraphy.
          It is trained on ~200 cursive characters from 
          <a href='https://en.wikipedia.org/wiki/Zhao_Mengfu'>Zhao Mengfu</a>'s 
          <i>Thousand Character Classic in Regular and Cursive Script (《赵孟頫真草千字文》)</i>,
          labeled using custom software by Lingdong Huang.
          It is largely based on 
          <a href='https://affinelayer.com/pixsrv/'>affinelayer's edges2cats demo</a>
          and 
          <a href='https://github.com/affinelayer/pix2pix-tensorflow'>pix2pix-tensorflow</a> project,
          and uses <a href="https://deeplearnjs.org">deeplearn.js</a> to perform GPU accelerated computation in your browser.
        </p>
        Lingdong Huang, April 2018
      </td>
    </tr></table>
    `),
  "Github": ()=>(`
    Fork or star this project on Github: <a href='https://github.com/LingDong-/edges2calligraphy/'>https://github.com/LingDong-/edges2calligraphy/</a>
  `),
  "Settings": ()=>(`
      <input onclick="ckbx_download = this.checked;" type="checkbox" `+(ckbx_download ? "checked" : "")+`> Use post-processed visuals when downloading<br>
      <input onclick="ckbx_new = this.checked; toggle_table_rule(ckbx_new)" type="checkbox" `+(ckbx_new ? "checked" : "")+`> Fill new cells with random characters
  `),
}

function toggle_table_rule(p){
  if (p){
    table.f = (i,j)=>{
      var c = new Cell(Math.floor(Math.random()*(examples.length-1)));
      cells.push(c);
      return c.div
    } 
  }else{
    table.f = (i,j)=>{
      var c = new Cell();
      cells.push(c);
      return c.div
    }
  }
}

drawer = `
<div id="drawer" style="
  ;background-color: rgba(31,30,30)
  ;box-shadow : 2px 2px 2px #000000DD
  ;position : fixed
  ;left : 0px
  ;top : -270px
  ;width : 100%
  ;color : rgba(255,255,255,0.7)
  ;font-family: 'Open Sans', sans-serif
  ;user-select:none
  ">
  <div id="menu" style="
      ;width : 100%
      ;padding : 10px 10px 10px 10px
      ;height : 250px
      ;display : block
    ">
    <table style="
      ;width : 100%
    "><tr>
      <td align="center" style = "
        ;width : 30%
        ;font-size : 18px
        ;color : rgba(255,255,255,0.7)
        ;vertical-align : top;
      "><div style="padding-top:40px"></div><div id="menu-toc"></div></td>
      <td style ="
        ;color : rgba(255,255,255,0.7)
        ;vertical-align : top
        ;padding-right : 50px
      "><div style = "
        ;font-size : 15px
        ;height: 255px
        ;overflow : scroll
      ">
          <span style="font-size:24px"><b>edges2calligraphy</b></span>
          <span style="font-size:16px"><i> - Turn your scribbles into Chinese calligraphy</i></span>
          <p></p>
        <div id="menu-text" style="">
        </div>
      </div></td>
    </tr></table>
  </div>

  <div id="bar" onclick = "toggleDrawer();" style="
    ;width : 100%
    ;height : 40px
    ;padding : 10px 5px 10px 5px
    ;cursor : pointer
  ">
    <table style="
      ;width : 100%
    "><tr>
      <td style = "
        ;font-size : 35px
        ;color : rgba(255,255,255,0.7)
        ;width : 10%
        ;cursor: pointer
      "><div onclick = "
          toggleDrawer();
        "><i class='material-icons'>menu</i></div></td>
      <td align = "right" style = "
        ;width : 35%
      ">
        <img src="images/icon.svg" height="30px"></img>
      </td>
      <td align="left" style="
        ;font-size : 24px
        ;color : rgba(255,255,255,0.7)
      ">&nbsp;&nbsp;edges2calligraphy</td>
    </tr><table>
  </div>

</div>
`
floatbox = `
<div id="float-box" style="
  ;width : 100%
  ;height : 900px
  ;color : rgba(255,255,255,0.7)
  ;position : fixed
  ;left : 50%
  ;top : 50%
  ;width : 480px
  ;height : 320px
  ;margin-left : -240px
  ;margin-top : -160px
  ;z-index : 10
  ;background-color: rgba(31,30,30)
  ;box-shadow : 2px 2px 2px #000000DD
  ;border-radius : 5px;
  ;color : rgba(255,255,255,0.7)
  ;font-family: 'Open Sans', sans-serif
  ;user-select:none
  ">
</div>
`

splash = `
  <table style="width:100%; height:100%"><tr style="height:100%; vertical-align:center">
    <td align="center" style="
        ;vertical-align : center
        ;color : rgba(255,255,255,0.7)
        ;font-size : 18px
      ">
      <div id = 'splash-image'></div>
      <h1>edges2calligraphy</h1>
      <div>Loading: <span id="load-progress"></span></div>
    <td>
  <tr></table>
`

function toggleDrawer(){
  // var t = parseInt(document.getElementById("drawer").style.top.replace("px",""))
  // document.getElementById("drawer").style.top = -Math.abs(t + 270)+ "px"
  if (document.getElementById("drawer").style.top == "0px"){
    for (var i = 0; i <= 10; i++){
      setTimeout((i)=>{
        document.getElementById("drawer").style.top = (-i*27) + "px"
      }, 10*i, i)
    }
  } else if (document.getElementById("drawer").style.top == "-270px"){
    for (var i = 0; i <= 10; i++){
      setTimeout((i)=>{
        document.getElementById("drawer").style.top = (-270+i*27) + "px"
      }, 10*i, i)
    }
  }
}

function menuSelect(t){
  console.log(t)
  for (var t1 in texts){
    var h1 = document.getElementById("menu-item-"+t1).innerHTML
    document.getElementById("menu-item-"+t1).innerHTML = h1.replace(/\<b\>\<u\>(.*)\<\/u\>\<\/b\>/g,"$1");
  } 
  document.getElementById('menu-text').innerHTML=texts[t]()
  var h = document.getElementById('menu-item-'+t).innerHTML;
  document.getElementById('menu-item-'+t).innerHTML = "<b><u>"+h+"</u></b>"
  
}
function menuHover(t){
  var h = document.getElementById('menu-item-'+t);
  h.style['text-decoration'] = "underline"
  
}
function menuUnhover(t){
  var h = document.getElementById('menu-item-'+t);
  h.style['text-decoration'] = "none"
}

function makeMenu(){
  document.body.appendChild(str2Elem(drawer))
  for (var t in texts){
    document.getElementById("menu-toc").innerHTML += 
    `<div id = "menu-item-`+t+`" style="padding-top:10px; cursor:pointer" \
      onclick="menuSelect('`+t+`');" \
      onmouseover="menuHover('`+t+`');" \
      onmouseout="menuUnhover('`+t+`');" \
      >`+t+`</div>`;
  }
}


function InfTable(f){
  this.table = document.createElement("table")
  this.f = f

  this.R0 = document.createElement("tr")
  this.R0C0 = document.createElement("td")
  this.R0C0.appendChild(this.f(0,0))
  this.R0.appendChild(this.R0C0) 
  this.table.appendChild(this.R0)

  this.xmin = 0
  this.xmax = 1
  this.ymin = 0
  this.ymax = 1
  
  this.expandLeft = function(){
    for (var i = this.ymin; i < this.ymax; i++){
      var j = this.xmin-1
      var r = "R"+i
      var c = "R"+i+"C"+j
      this[c] = document.createElement("td")
      this[c].appendChild(this.f(i,j))
      this[r].insertBefore(this[c], this[r].firstChild)
    }
    this.xmin -= 1
  }
  this.expandRight = function(){
    for (var i = this.ymin; i < this.ymax; i++){
      var j = this.xmax
      var r = "R"+i
      var c = "R"+i+"C"+j
      this[c] = document.createElement("td")
      this[c].appendChild(this.f(i,j))
      this[r].appendChild(this[c])
    }
    this.xmax += 1
  }
  this.expandTop = function(){
    var i = this.ymin-1
    var r = "R"+i
    this[r] = document.createElement("tr")
    for (var j = this.xmin; j < this.xmax; j++){  
      var c = "R"+i+"C"+j
      this[c] = document.createElement("td")
      this[c].appendChild(this.f(i,j))
      this[r].appendChild(this[c])
    }
    this.table.insertBefore(this[r],this.table.firstChild)
    this.ymin -= 1
  }
  this.expandBottom = function(){
    var i = this.ymax
    var r = "R"+i
    this[r] = document.createElement("tr")
    for (var j = this.xmin; j < this.xmax; j++){  
      var c = "R"+i+"C"+j
      this[c] = document.createElement("td")
      this[c].appendChild(this.f(i,j))
      this[r].appendChild(this[c])
    }
    this.table.appendChild(this[r])
    this.ymax += 1
  }
}

function str2Elem(str){
  var temp = document.createElement("div")
  temp.innerHTML = str
  return temp
}

function addStrFunc(elem,attr,fstr){
  var temp = document.createElement("div")
  temp.innerHTML = elem.outerHTML.split(">")[0]
    +" "+attr+" = \""+fstr+"\""
    +">"+elem.outerHTML.split(">").slice(1).join(">")
  return temp.firstChild
}


function TextButt(text,f){
  var button = document.createElement("div")
  //button.style.border="1px solid rgba(255,255,255,0.6)"
  button.innerHTML = text
  
  button.style.width = "30px"
  button.style.height = "30px"
  button.style['border-radius'] = "5px"
  button.style.color = "rgba(255,255,255,0.4)"

  button.style["text-align"] = "center"
  button.style["font-size"] = "30px"
  button.style.cursor = "pointer"
  button.style["user-select"] = "none"

  button = addStrFunc(button, "onmouseover", "this.style.color = 'rgba(255,255,255,0.9)'")
  button = addStrFunc(button, "onmouseout", "this.style.color = 'rgba(255,255,255,0.4)'")

  button.onclick = f
  return button
}

function OvalButt(text,f){
  var button = document.createElement("div")
  button.style.border="2px solid rgba(255,255,255,0.6)"
  button.innerHTML = "<span style='position:relative;top:0px;'><b>"+text+"</b></span>"
  
  button.style.width = "80px"
  button.style.height = "22px"
  button.style['border-radius'] = "14px"
  button.style.color = "rgba(255,255,255,0.6)"
  button.style.paddingTop = "2px"
  button.style["text-align"] = "center"
  button.style["font-size"] = "15px"
  button.style["font-family"] = "'Open Sans'"
  button.style.cursor = "pointer"
  button.style["user-select"] = "none"

  button = addStrFunc(button, "onmouseover", "this.style['background-color'] = 'rgba(255,255,255,0.05)'")
  button = addStrFunc(button, "onmouseout", "this.style['background-color'] = 'rgba(255,255,255,0)'")

  button.onclick = f
  return button
}


function mousedraw(cell,ctx,x,y,color){
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round"
  if (cell.lastX != -1){
    ctx.beginPath();
    ctx.moveTo(cell.lastX+0.5,cell.lastY+0.5);
    ctx.lineTo(x+0.5,y+0.5);
    ctx.stroke();
  }
}

function drawexample(eg,ctx,color){
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round"
  for (var l in eg.lines){
    if (eg.lines[l].length > 0){
      ctx.beginPath();
      ctx.moveTo(eg.lines[l][0][0]*SIZE, eg.lines[l][0][1]*SIZE+10);
      for (var i = 1; i < eg.lines[l].length; i++){
        ctx.lineTo(eg.lines[l][i][0]*SIZE,eg.lines[l][i][1]*SIZE+10)
      }
      ctx.stroke();
    }
  }
}
function compareCtx(ctx0,ctx1){
  var im0 = ctx0.canvas.toDataURL("image/png");
  var im1 = ctx1.canvas.toDataURL("image/png");
  var size = ctx0.canvas.width
  var s = "display:inline-block; overflow: hidden; width : "+size/2+"; padding: 0; margin:0; border: 1px solid rgba(255,255,255,0.5)"
  var d = `
    <div style="width : `+(size+5)+`px; padding: 0; margin:0" onmousemove="
        var rect = this.getBoundingClientRect();
        var x = mouseX - rect.left;
        var y = mouseY - rect.top;
        x = Math.min(Math.max(x,0),`+size+`)
        this.children[0].style.width=x+'px';
        this.children[1].style.width=(`+size+`-x)+'px';
        this.children[1].children[0].style['margin-left']=(-x)+'px';
      ">
      <div style='`+s+`'><div style="padding: 0; margin:0"><img src='`+im0+`'></div></div>`+
      `<div style='`+s+`'><div style="padding: 0; margin-left:-`+(size/2)+`px"><img src='`+im1+`'></div></div>
    </div>
  `
  return d
}


function Cell(n){

  this.div = document.createElement("div")
  this.div.cell = this
  var id = "CELL:"+Math.random()
  this.div.id = id
  this.div.style.padding = "2px 2px 2px 2px"
  this.div.style.position = "relative"

  this.input = createContext(SIZE, SIZE, SCALE)
  this.input.fillStyle = "#FFFFFF"
  this.input.fillRect(0, 0, SIZE, SIZE)

  this.display = createContext(SIZE, SIZE, SCALE)
  this.display.canvas.style.border="1px solid rgba(255,255,255,0.5)"
  this.display.canvas.style["border-radius"] = "5px"
  
  this.div.appendChild(this.display.canvas)
  //this.div.appendChild(this.input.canvas)

  this.output = createContext(SIZE, SIZE, SCALE)
  this.output.canvas.style.display = "none"

  this.output_raw = createContext(SIZE, SIZE, SCALE)

  this.current = this.display

  this.div.appendChild(this.output.canvas)

  this.progframe = document.createElement("div")
  this.progframe.style.position = "absolute"
  this.progframe.style.left = "2px";
  this.progframe.style.top = "2px";
  this.progframe.style.overflow = "hidden"
  this.progframe.style.border = "1px solid rgba(0,0,0,0)"
  this.progframe.style['border-radius'] = "5px 5px 0px 0px"
  this.progframe.style.height = "2px"
  this.progframe.style.width = SIZE+"px"
  this.progframe.style['background-color'] = "rgba(255,255,255,0)"
  this.div.appendChild(this.progframe)

  this.progbar = document.createElement("div")
  this.progbar.style.position = "absolute"
  this.progbar.style.left = "0px";
  this.progbar.style.top = "0px";
  this.progbar.style['border-radius'] = "0px 0px 0px 0px"
  this.progbar.style.height = "2px"
  this.progbar.style.width = "0px"
  this.progbar.style['background-color'] = "rgba(255,255,255,0.8)"
  this.progframe.appendChild(this.progbar)

  if (n != undefined){
    var eg = examples[n]
    drawexample(eg, this.input, COLinput )
    drawexample(eg, this.display, COLdisplay )
  }
  this.modified = false
  this.penDown = false
  this.lastX = -1
  this.lastY = -1

  this.stage = 0
  this.hasMouse = false

  this.ok_button = OvalButt("DONE",function(){
    if (LOCK == undefined){
      document.getElementById(id).cell.stage = 1
      LOCK = id
      pix2pix(document.getElementById(id).cell.input,
              document.getElementById(id).cell.output).then((s)=>{
                LOCK = undefined
                PROGRESS = 0
                document.getElementById(id).cell.output_raw.drawImage(document.getElementById(id).cell.output.canvas,0,0)
                postProcess(document.getElementById(id).cell.output)
                document.getElementById(id).cell.stage = 2
              })
    }
  })
  
  this.ok_button.style.position = "absolute"
  this.ok_button.style.left = SIZE/2-40;
  this.ok_button.style.top = SIZE-30;

  this.x_button = TextButt("<i class='material-icons'>clear</i>",function(){
    document.getElementById(id).cell.input.fillStyle = "#FFFFFF"
    document.getElementById(id).cell.input.fillRect(0, 0, SIZE, SIZE)
    document.getElementById(id).cell.display.clearRect(0, 0, SIZE, SIZE);
  })
  this.x_button.style.position = "absolute"
  this.x_button.style.left = 10;
  this.x_button.style.top = 10;


  this.rand_button = TextButt("<i class='material-icons'>style</i>",function(){
    document.getElementById(id).cell.input.fillStyle = "#FFFFFF"
    document.getElementById(id).cell.input.fillRect(0, 0, SIZE, SIZE)
    document.getElementById(id).cell.display.clearRect(0, 0, SIZE, SIZE);

    var eg = examples[Math.floor(Math.random()*examples.length)]
    drawexample(eg, document.getElementById(id).cell.input, COLinput )
    drawexample(eg, document.getElementById(id).cell.display, COLdisplay )
  })
  this.rand_button.style.position = "absolute"
  this.rand_button.style.left = 10;
  this.rand_button.style.top = 50;

  this.back_button = TextButt("<i class='material-icons'>replay</i>",function(){
    document.getElementById(id).cell.stage = 0
  })
  this.back_button.style.position = "absolute"
  this.back_button.style.display = "none"
  this.back_button.style.left = SIZE-40;
  this.back_button.style.top = 10;

  this.more_button = TextButt("<i class='material-icons'>flip</i>",function(){
    var cb = createContext(SIZE*2,SIZE,SCALE)
    if (ckbx_download){
      cb.drawImage(document.getElementById(id).cell.display.canvas,0,0)
      cb.drawImage(document.getElementById(id).cell.output.canvas,SIZE,0)
    }else{
      cb.drawImage(document.getElementById(id).cell.input.canvas,0,0)
      cb.drawImage(document.getElementById(id).cell.output_raw.canvas,SIZE,0)
    }
    CTX_CACHE = cb;
    var tweet = "https://twitter.com/share?url="
      +window.location.href
      +"&amp;text="+window.location.href+";hashtags=edges2calligraphy";

    document.getElementById('float-box').style.display="block"
    document.getElementById('float-box').innerHTML = ""
    document.getElementById('float-box').innerHTML = 
      `<table style='width:100%'><tr style='width:100%'><td align='center' style='vertical-align:middle'>
        <div style='padding-top:10px'></div>`+

      compareCtx(
        document.getElementById(id).cell.display,
        document.getElementById(id).cell.output
      )
      +`<div style='color:rgba(255,255,255,0.7); font-size: 18px; padding-top: 5px'> 
          <a onclick="downloadContext(CTX_CACHE)" style="cursor:pointer; text-decoration:underline;"><span style='position:relative; top: 5px; font-size: 24px'><i class='material-icons'>file_download</i></span>Download</a>
          &nbsp;&nbsp;&nbsp;
          <a href="`+tweet+`" style="cursor:pointer"><span style='position:relative; top: 5px; font-size: 24px'><i class='material-icons'>share</i></span>Share</a>
        </div>`
      +"</td></tr></table>"
    var close = TextButt("<i class='material-icons'>clear</i>",function(){
      document.getElementById('float-box').style.display="none"
    })
    close.style.position = "absolute"
    close.style.left = 10;
    close.style.top = 10;
    document.getElementById('float-box').appendChild(close)


  })
  this.more_button.style.position = "absolute"
  this.more_button.style.display = "none"
  this.more_button.style.left = SIZE-80;
  this.more_button.style.top = 10;

  this.div.appendChild(this.ok_button)
  this.div.appendChild(this.x_button)
  this.div.appendChild(this.rand_button)
  this.div.appendChild(this.back_button)
  this.div.appendChild(this.more_button)

  function px2int(px){
    return parseInt(px.replace("px",""))
  }

  this.inButton = function(button,x,y){

    if (px2int(button.style.left) < x && x < px2int(button.style.left)+px2int(button.style.width) && 
        px2int(button.style.top) < y && y < px2int(button.style.top)+px2int(button.style.height)){
      return true
    }
    return false
  }

  this.receiveMousePos = function(x,y) {
    if (this.penDown && this.stage == 0){
      mousedraw(this,this.input,  x,y,COLinput)
      mousedraw(this,this.display,x,y,COLdisplay)
      this.lastX = x
      this.lastY = y
    } 

    if (0 < x && x < SIZE && 0 < y && y < SIZE){
      this.hasMouse = true;
    }else{
      this.hasMouse = false;
    }
  }
  this.receiveMouseDown = function(x,y){
    if (this.inButton(this.ok_button,x,y) ||
        this.inButton(this.x_button,x,y) ||
        this.inButton(this.rand_button,x,y) ||
        this.inButton(this.back_button,x,y) ){
      this.penDown = false;
    }else{
      this.penDown = true;
    }
  }
  this.receiveMouseUp = function(x,y){
    this.penDown = false;
    this.lastX = -1
    this.lastY = -1
  }

  this.update = function(){

    if (LOCK == this.div.id){
      this.progbar.style.width = (SIZE*PROGRESS/15)+"px"
    }else{
      this.progbar.style.width = "0px"
    }
    switch(this.stage){

      case 0:
        this.current = this.display
        this.output.canvas.style.display = "none"
        this.display.canvas.style.display = "block"
        this.back_button.style.display = "none"
        this.more_button.style.display = "none"
        if (this.hasMouse && ! this.penDown){
          this.ok_button.style.display = "block"
          this.rand_button.style.display = "block"
          this.x_button.style.display = "block"
        }else{
          this.ok_button.style.display = "none"
          this.rand_button.style.display = "none"
          this.x_button.style.display = "none"
        }
        break;
      case 1:
        this.current = this.display
        this.output.canvas.style.display = "none"
        this.display.canvas.style.display = "block"
        this.back_button.style.display = "none"
        this.more_button.style.display = "none"
        this.ok_button.style.display = "none"
        this.rand_button.style.display = "none"
        this.x_button.style.display = "none"
        break;
      case 2:
        this.current = this.output
        this.output.canvas.style.display = "block"
        this.display.canvas.style.display = "none"
        this.ok_button.style.display = "none"
        this.rand_button.style.display = "none"
        this.x_button.style.display = "none"
        if (this.hasMouse){
          this.back_button.style.display = "block"
          this.more_button.style.display = "block"
        }else{
          this.back_button.style.display = "none"
          this.more_button.style.display = "none"
        }
        break;
    }
  }
}

function update(t) {
  var x0 = window.scrollX
  var y0 = window.scrollY
  var w = window.innerWidth
  var h = window.innerHeight

  if (x0+w > (table.xmax-table.xmin)*SIZE-10){
    table.expandRight()
    console.log("exp right to"+table.xmax)
  }
  if (y0+h > (table.ymax-table.ymin)*SIZE-10){
    table.expandBottom()
    console.log("exp bottom to"+table.ymax)
  }
  if (x0 < 50){
    table.expandLeft()
    window.scrollTo(SIZE, y0);
    console.log("exp left to"+table.xmin)
  }
  if (y0 < 50){
    table.expandTop()
    window.scrollTo(x0, SIZE);
    console.log("exp top to"+table.ymin)
  }
  for (var i = 0; i < cells.length; i++){
    cells[i].update();
  }

  setTimeout(update,100)
}


function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY 
  for (var i = 0; i < cells.length; i++){
    var rect = cells[i].current.canvas.getBoundingClientRect();
    cells[i].receiveMousePos(e.clientX - rect.left, e.clientY - rect.top)
  }
}
function onMouseDown(e) {
  for (var i = 0; i < cells.length; i++){
    var rect = cells[i].current.canvas.getBoundingClientRect();
    cells[i].receiveMouseDown(e.clientX - rect.left, e.clientY - rect.top)
  }
}
function onMouseUp(e) {
  for (var i = 0; i < cells.length; i++){
    var rect = cells[i].current.canvas.getBoundingClientRect();
    cells[i].receiveMouseUp(e.clientX - rect.left, e.clientY - rect.top)
  }
}
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);

function load(){
  return Promise.all([
    new Promise (function(resolve,reject){
      loadJSON("dataset.json",(response)=>{
        console.log("test set loaded")
        examples = JSON.parse(response);
        resolve("OK!")
      })
    }),
    new Promise (function(resolve,reject){
      fetch_weights(WEIGHTS_PATH, (x,y)=>{
          document.getElementById('load-progress').innerHTML = x+" / "+y
        }).then((weights) => {
          console.log("weights loaded")
          resolve("OK!")
      })
    }),
    new Promise (function(resolve,reject){
      setTimeout(()=>(resolve("OK!")),1000)
    })
  ])
}

function preload(){
  return new Promise(function(resolve,reject){
    var img = new Image()
    img.src = 'images/icon.svg'
    img.width = '250'
    img.onload = function(){
      document.body.appendChild(str2Elem(floatbox))
      document.getElementById('float-box').innerHTML = splash
      document.getElementById('splash-image').appendChild(img)
      resolve("OK!")
    }
  })
}

function downloadContext(ctx){
  var down = document.createElement('a')
  down.innerHTML = "[Download]"
  down.addEventListener('click', function() {
    this.href = ctx.canvas.toDataURL();
    this.download = SEED;
  }, false);
  document.body.appendChild(down);
  down.click()
  document.body.removeChild(down);
}

makeBG({col:[0.145,0.15,0.15],tex:30,spr:0})

function check_browser_compatibility(){
  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]" 
  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+
  var isChrome = !!window.chrome;

  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;

  if (isFirefox || isChrome){
    return true
  }
  if (isSafari){
    window.alert("This demo does not work in Safari. We recommend Chrome or Firefox.")
  }else{
    window.alert("This demo is not tested for your browser. We recommend Chrome or Firefox.") 
  }
}



preload().then(()=>{
  check_browser_compatibility()
  load().then(()=>{
    console.log("ready")
    table = new InfTable((i,j)=>{
      var n = undefined;
      if (-1 <= i && i <= 0 && -1 <= j && j <= 0){ n = i+1+(1-j-1)*2 }
      var c = new Cell(n);
      cells.push(c);
      return c.div
    })
    makeMenu()
    document.getElementById("float-box").classList.add("remove")
    setTimeout(()=>{
      document.getElementById("float-box").style.display="none"
      document.getElementById("float-box").classList.remove("remove")
    },990)
    document.getElementById("DIV0").appendChild(table.table)
    menuSelect("Help")

    //setTimeout(()=>(toggleDrawer()),1000)
    update()
  })
})

