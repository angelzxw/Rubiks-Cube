// Define Variables
const BLACK = vec4(0.0, 0.0, 0.0, 1.0);
const YELLOW = vec4(1.0, 1.0, 0.0, 1.0);
const WHITE = vec4(1.0, 1.0, 1.0, 1.0);
const ORANGE = vec4(1.0, 0.5, 0.0, 1.0);
const RED = vec4(1.0, 0.0, 0.0, 1.0);
const BLUE = vec4(0.0, 0.0, 1.0, 1.0);
const GREEN = vec4(0.0, 1.0, 0.0, 1.0);
const COLORS = [
  // Back
  YELLOW, YELLOW, YELLOW, YELLOW,
  // Front
  WHITE, WHITE, WHITE, WHITE,
  // Left
  ORANGE, ORANGE, ORANGE, ORANGE,
  // Right
  RED, RED, RED, RED,
  // Bottom
  BLUE, BLUE, BLUE, BLUE,
  // Top
  GREEN, GREEN, GREEN, GREEN,
  // Inside
  BLACK,
];

var canvas;
var gl;

var _Pmatrix;
var _MVmatrix;
var projMatrix = mat4();
var mvMatrix = mat4();

var THETA = radians(45);
var PHI = radians(45);

var eye = vec3(0.0, 0.0, 1.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var fovy = 45.0;  // Angle (in degrees) of the field-of-view in the Y-direction
var aspect = 1.0; // Aspect ratio of the viewport
var near = 0.3;
var far = 1000;
var cameraRadius = 20.0;

var rotationAngle = 5;  // MUST be a factor of 90
var animationTimer = 1; // delay in milliseconds

var program;
var cBuffer;
var vColor;
var currentAngle = 0;
var interval;
var isAnimating = false;
var animationQueue = [];

var fileContent;
var fileLoaded = false;

// Geometry Variables
var vertices = [
  -1,-1,-1,     1,-1,-1,      1, 1,-1,      -1, 1,-1,
  -1,-1, 1,     1,-1, 1,      1, 1, 1,      -1, 1, 1,
  -1,-1,-1,     -1, 1,-1,     -1, 1, 1,     -1,-1, 1,
  1,-1,-1,      1, 1,-1,      1, 1, 1,      1, -1, 1,
  -1,-1,-1,     -1,-1, 1,     1,-1, 1,      1,-1,-1,
  -1, 1,-1,     -1, 1, 1,     1, 1, 1,      1, 1,-1,
];

var vertexColors = [];

var indices = [
  // Front
  0,1,2, 0,2,3,
  // Back
  4,5,6, 4,6,7,
  // Left
  8,9,10, 8,10,11,
  // Right
  12,13,14, 12,14,15,
  // Bottom
  16,17,18, 16,18,19,
  // Top
  20,21,22, 20,22,23
];

var cubePosition = [
  [[[],[],[]],[[],[],[]],[[],[],[]]],
  [[[],[],[]],[[],[],[]],[[],[],[]]],
  [[[],[],[]],[[],[],[]],[[],[],[]]]
];

var moves = [
  "L", "l", "M", "m", "R", "r", "B", "b", "E",
  "e", "T", "t", "F", "f","S", "s", "K", "k"
];

var LRotate = ["L","F","R","K","L","F","R","K"];
var MRotate = ["M","S","m","s","M","S","m","s"];
var RRotate = ["R","K","L","F","R","K","L","F"];
var TRotate = ["B","B","B","B","T","T","T","T"];
var ERotate = ["e","e","e","e","E","E","E","E"];
var BRotate = ["T","T","T","T","B","B","B","B"];
var FRotate = ["K","L","F","R","F","R","K","L"];
var SRotate = ["s","M","S","m","S","m","s","M"];
var KRotate = ["F","R","K","L","K","L","F","R"];
var lRotate = ["l","f","r","k","l","f","r","k"];
var mRotate = ["m","s","M","S","m","s","M","S"];
var rRotate = ["r","k","l","f","r","k","l","f"];
var tRotate = ["b","b","b","b","t","t","t","t"];
var eRotate = ["E","E","E","E","e","e","e","e"];
var bRotate = ["t","t","t","t","b","b","b","b"];
var fRotate = ["k","l","f","r","f","r","k","l"];
var sRotate = ["S","m","s","M","s","M","S","m"];
var kRotate = ["f","r","k","l","k","l","f","r"];

var textFile = null,
  makeTextFile = function(text){
    var data = new Blob([text],{type: 'text/plain'});
    if (textFile !== null){
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  };



window.onload = function init(){
  if (window.File && window.FileReader && window.FileList && window.Blob){
    console.log("This is working");
  }else{
    console.log("Not all the file APIs are supported!");
  }

  // Creating a canvas
  canvas = document.getElementById("game-surface");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl){
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Array element buffer
  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  // Color array attribute buffer
  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var _vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(_vPosition);

  _Pmatrix = gl.getUniformLocation(program, "projectionMatrix");
  _MVmatrix = gl.getUniformLocation(program, "modelViewMatrix");

  initPosition();

  // Mouse events
  var drag = false;
  var old_x, old_y;

  var mouseDown = function(e){
     drag = true;
     old_x = e.pageX,
     old_y = e.pageY;
     e.preventDefault();
     return false;
  };

  var mouseUp = function(e){
     drag = false;
  };

  var mouseMove = function(e){
    if (!drag){
      return false;
    }
    var dX = e.pageX - old_x;
    var dY = e.pageY - old_y;

    var phi = Math.abs((PHI/ Math.PI * 180.0)%360);

    // Rotation beyond +-360 degrees
    if (phi > 180.0 && phi < 270.0 || PHI < 0.0){
      if ((PHI/ Math.PI * 180.0)%360 < -180.0){
        up = vec3(0.0, 1.0, 0.0);
        THETA += -dX*2*Math.PI/canvas.width;
      } else{
        up = vec3(0.0, -1.0, 0.0);
        THETA += dX*2*Math.PI/canvas.width;
      }
    } else{
      if (phi > 270.0){
        up = vec3(0.0, -1.0, 0.0);
        THETA += dX*2*Math.PI/canvas.width;
      } else{
        up = vec3(0.0, 1.0, 0.0);
        THETA += -dX*2*Math.PI/canvas.width;
      }
    }
    PHI += -dY*2*Math.PI/canvas.height;
    old_x = e.pageX;
    old_y = e.pageY;
    e.preventDefault();
  };

  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mouseout", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);


  // Set up button listeners
  document.getElementById("LBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("MBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("RBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("BBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("EBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("TBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("FBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("SBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("KBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("lBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("mBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("rBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("bBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("eBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("tBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("fBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("sBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("kBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};

  document.getElementById("loadBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("saveBtn").onclick = function(){
    animationQueue.push(correctFace(this.value));};
  document.getElementById("rdmBtn").onclick = function(){
    randomize();};

  document.getElementById("loadBtn").onclick = function (){
    if (!fileLoaded){
      alert("Attention! You have not specified a cube state file.");
    } else{
      cubePosition = fileContent.slice();
    }
  };
  document.getElementById("saveBtn").onclick = function (){
    var link = document.getElementById("downloadlink");
    link.href = makeTextFile(JSON.stringify(cubePosition));
    link.innerHTML = "Download Here!";
  };

  render();
}

function randomize(){
  var turns = document.getElementById("inputVal").value;
  if(isNaN(turns) || !turns || turns > 9999 || turns < 0){
    alert("Please enter a valid value.");
  }else if (animationQueue.length != 0){
    alert("There are already moves in the animation queue!");
  }else{
    var randomVal;
    for (i = 0; i < turns; i++){
       randomVal = Math.floor(Math.random() * 18);
       animationQueue.push(correctFace(moves[randomVal]));
    }
  }
}

function initPosition(){
  for (i = -1; i < 2; i++){
    for (j = -1; j < 2; j++){
      for (k = -1; k < 2; k++){
        cubePosition[i+1][j+1][k+1][0] = i; // x
        cubePosition[i+1][j+1][k+1][1] = j; // y
        cubePosition[i+1][j+1][k+1][2] = k; // z
        cubePosition[i+1][j+1][k+1][3] = [vec3(-1,0,0),vec3(0,-1,0),vec3(0,0,-1)]; // ref_axises
        cubePosition[i+1][j+1][k+1][4] = mat4(); // rotaton matrix
      }
    }
  }
}

// Access and modify rotation matrices
function getRotationAxis(x,y,z){
  return cubePosition[x+1][y+1][z+1][3];
}
function getRotationMatrix(x,y,z){
  return cubePosition[x+1][y+1][z+1][4];
}
function setRotationMatrix(x,y,z,m){
  cubePosition[x+1][y+1][z+1][4] = m;
}

function correctFace(face){
  var newFace;
  var theta = (THETA/ Math.PI * 180.0)%360;
  var phi = (PHI/ Math.PI * 180.0)%360;
  var i;
  if ((phi >= -180 && phi < 0) || (phi >= 180 && phi < 360)){
    if (theta < -315 || (theta >= -45 && theta < 45) || theta >= 315){
      i = 0;
    } else if ((theta >= -315 && theta < -225) || (theta >= 45 && theta < 135)){
      i = 1;
    } else if ((theta >= -225 && theta < -135) || (theta >=135 && theta < 225)){
      i = 2;
    } else if ((theta >= -135 && theta < -45) || (theta >= 215 && theta < 315)){
      i = 3;
    }
  } else{
    if (theta < -315 || (theta >= -45 && theta < 45) || theta >= 315){
      i = 4;
    } else if ((theta >= -315 && theta < -225) || (theta >= 45 && theta < 135)){
      i = 5;
    } else if ((theta >= -225 && theta < -135) || (theta >=135 && theta < 225)){
      i = 6;
    } else if ((theta >= -135 && theta < -45) || (theta >= 215 && theta < 315)){
      i = 7;;
    }
  }
  switch(face){
    case "L":
      newFace = LRotate[i];;
    break;
    case "l":
      newFace = lRotate[i];;
    break;
    case "M":
      newFace = MRotate[i];;
    break;
    case "m":
      newFace = mRotate[i];;
    break;
    case "R":
      newFace = RRotate[i];;
    break;
    case "r":
      newFace = rRotate[i];;
    break;
    case "T":
      newFace = TRotate[i];;
    break;
    case "t":
      newFace = tRotate[i];;
    break;
    case "B":
      newFace = BRotate[i];;
    break;
    case "b":
      newFace = bRotate[i];;
    break;
    case "E":
      newFace = ERotate[i];;
    break;
    case "e":
      newFace = eRotate[i];;
    break;
    case "F":
      newFace = FRotate[i];;
    break;
    case "f":
      newFace = fRotate[i];;
    break;
    case "K":
      newFace = KRotate[i];;
    break;
    case "k":
      newFace = kRotate[i];;
    break;
    case "S":
      newFace = SRotate[i];;
    break;
    case "s":
      newFace = sRotate[i];;
    break;
  }
  return newFace;
}

function  colorDisplay(x, y, z){
  var i;
  for (i = 0; i < vertexColors.length; i++){
    vertexColors[i] = COLORS[i];
  }
  var start;
  if (x != -1){
    makeBlack(8);
  }
  if (x != 1){
    makeBlack(12);
  }
  if (y != -1){
    makeBlack(16);
  }
  if (y != 1){
    makeBlack(20);
  }
  if (z != -1){
    makeBlack(0);
  }
  if (z != 1){
    makeBlack(4);
  }
  // Any non-surface faces
  function makeBlack(start){
    var i;
    for (i = start; i < start+ 4; i++){
      vertexColors[i] = COLORS[24];
    }
  }
}
function animate(action){
  interval = setInterval(function(){rotation(action)}, animationTimer);
}

function render(){
  if (animationQueue.length != 0 && !isAnimating){
    animate(animationQueue.shift());
    isAnimating = true;
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Set the camera position at each render
  eye = vec3(cameraRadius*Math.sin(PHI)*Math.sin(THETA),
    cameraRadius*Math.cos(PHI),
    cameraRadius*Math.sin(PHI)*Math.cos(THETA));

  // using the perspective function,
  // which returns a 4x4 matrix
  projMatrix = perspective(fovy, aspect, near, far);
  mvMatrix = lookAt(eye, at, up);
  var x, y, z;
  for (x = -1; x <= 1; x++){
    for (y = -1; y <= 1; y++){
      for (z = -1; z <= 1; z++){
        if (x !=0 || y !=0 || z!=0){ // Any non-center cube
          var tmp = mvMatrix;
          mvMatrix = mult(mvMatrix, getRotationMatrix(x,y,z));
          mvMatrix = mult(mvMatrix, translate(vec3(x*2.1,y*2.1,z*2.1)));
          colorDisplay(x, y, z);
          cBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
          vColor = gl.getAttribLocation(program, "vColor");
          gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
          gl.enableVertexAttribArray(vColor);
          gl.uniformMatrix4fv(_Pmatrix, false, flatten(projMatrix));
          gl.uniformMatrix4fv(_MVmatrix, false, flatten(mvMatrix));
          gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
          mvMatrix = tmp;
        }
      }
    }
  }
  requestAnimFrame(render);
}
