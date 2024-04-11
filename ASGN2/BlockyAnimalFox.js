// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
// Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
//   gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log("Failed to get the storage location of a u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const STARS = 3;

//globals related to ui elements
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=5.0;
let g_selectedType=POINT;
let g_segments = 10;
let ranvar = 0;
let g_globalAngle = 0;
let g_yelloAngle = 0;
let g_magentaAngle= 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let headJoint = 0;
let tailJoint = 0;
let tailJoint2 = 0;
let tailJoint3 = 0;
let g_sAnimation = false;
let g_footanimation = 0;

//set up actions for the html ui elements
function addActionsForHtmlUI(){

    //button events (shape type)
    // document.getElementById('animationYellowButtonOff').onclick = function() {g_yellowAnimation = false;};
    // document.getElementById('animationYellowButtonOn').onclick = function() {g_yellowAnimation = true;};
    document.getElementById('animationMOff').onclick = function() {g_magentaAnimation = false;};
    document.getElementById('animationMOn').onclick = function() {g_magentaAnimation = true;};

    //slider events
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes();});
    // document.getElementById('yelloSlide').addEventListener('mousemove', function(){ g_yelloAngle = this.value; renderAllShapes();});
    document.getElementById('magentaSlide').addEventListener('mousemove', function(){ g_magentaAngle = this.value; renderAllShapes();});
    document.getElementById('headjoint').addEventListener('mousemove', function() {headJoint = this.value; renderAllShapes();});
    document.getElementById('tailjoint').addEventListener('mousemove', function() {tailJoint = this.value; renderAllShapes();});
    document.getElementById('tailjoint2').addEventListener('mousemove', function() {tailJoint2 = this.value; renderAllShapes();});
    document.getElementById('tailjoint3').addEventListener('mousemove', function() {tailJoint3 = this.value; renderAllShapes();});
    

    //size slider events
    // document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });

    // document.getElementById('segments').addEventListener('mouseup', function() {g_segments = this.value;});


}

function main() {

    // set up canvas and gl variables
    setupWebGL();
    // set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
    //set up actions for the html ui elements
    addActionsForHtmlUI();
  

  // Register function (event handler) to be called on a mouse press
//   canvas.onmousedown = click;
  //hold to draw
//   canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) } };
  canvas.onmousedown = function(ev) { if (ev.shiftKey && g_yellowAnimation == false) { g_yellowAnimation = true;} else{ g_yellowAnimation = false;}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
function tick(){
    g_seconds = performance.now()/1000.0 - g_startTime;
    // console.log(g_seconds);//print debug informaiton so we know we are running

    //update animation angles
    updateAnimationAngles();
    //draw everything
    renderAllShapes();

    //make browser constantly update
    requestAnimationFrame(tick);

}


var g_shapesList = [];

function updateAnimationAngles(){
    if (g_yellowAnimation) {
        g_yelloAngle = (45*Math.sin(g_seconds));
        tailJoint = (45*Math.sin(3*g_seconds));
        tailJoint2 = (45*Math.sin(3*g_seconds));
        tailJoint3 = (45*Math.sin(3*g_seconds));
    }
    if (g_magentaAnimation){
        g_magentaAngle = (45*Math.sin(3*g_seconds));
        tailJoint = (45*Math.sin(3*g_seconds));
        tailJoint2 = (45*Math.sin(3*g_seconds));
        tailJoint3 = (45*Math.sin(3*g_seconds));
    }
}

function renderAllShapes(){

    var startTime = performance.now();

    //pass the matrix to u_modelmatrix*attribute
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    renderScene();


  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function renderScene(){
    var body = new Cube();
    body.color = [0.82, 0.32, 0.0, 1.0];
  //   body.matrix.translate(-.65, -.15, -0.40);
  //   body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.translate(-0.1, 0 ,-0.16);
  //   body.matrix.scale(.3, .3, .5625);
    body.matrix.scale(.2, .2, .375);
    var bodyCoordinates = new Matrix4(body.matrix);
    var tailcoordinates = new Matrix4(body.matrix);
    var feetcoordinates = new Matrix4(body.matrix);
    body.render();
  
    var head = new Cube();
    head.color = [0.98, 0.50, 0.11, 1.0];
    head.matrix = bodyCoordinates;
    head.matrix.translate(.5, -0.2, -0.46);
    head.matrix.rotate(-g_yelloAngle, 0, 0, 1);
    head.matrix.scale(1.3, 1.1, .5);
    head.matrix.translate(-.5, 0, 1.0);
    head.matrix.rotate(-90, 1, 0, 0);
    head.matrix.rotate(headJoint, 1, 0, 0);
    var yellowCoordinates = new Matrix4(head.matrix);
    var earss2 =  new Matrix4(head.matrix);
    var eyes = new Matrix4(head.matrix);
    head.render();
  
  
    var eye1 = new Cube();
    eye1.color = [0, 0, 0, 1];
    eye1.matrix = eyes;
    eye1.matrix.translate(0.85, 1.1, 0.4);
    eye1.matrix.scale(0.15, 0.08, 0.15);
    var eyes1s1 = new Matrix4(eye1.matrix);
    eye1.matrix.translate(0, -1.1,0);
    eye1.matrix.scale(1, 0.5, 1);
    var eyes1s2 = new Matrix4(eye1.matrix);
    var eyes2 = new Matrix4(eye1.matrix);
    eye1.render();
  
    var eye1s1 = new Cube();
    eye1s1.color = [1, 1, 1, 1];
    eye1s1.matrix = eyes1s1;
    eye1s1.matrix.translate(1.05, -3.9, 0);
    eye1s1.matrix.scale(0, 2.5, 1);
  //   var eyes2s2 = new Matrix4(eye1s1.matrix);
    eye1s1.render();
  
    var eye1s2 = new Cube();
    eye1s2.color = [1, 1, 1, 1];
    eye1s2.matrix = eyes1s2;
    eye1s2.matrix.translate(-1, 0, 0);
    eye1s2.render();
  
    var eye2 = new Cube();
    eye2.color = [0, 0, 0, 1];
    eye2.matrix = eyes2;
    eye2.matrix.translate(-5.6, 0, 0);
    var eyes2s1 = new Matrix4(eye2.matrix);
    var eyes2s2 = new Matrix4(eye2.matrix);
    var nosecor = new Matrix4(eye2.matrix);
    eye2.render();
  
    var eye2s1 = new Cube();
    eye2s1.color = [1, 1, 1, 1];
    eye2s1.matrix = eyes2s1;
    eye2s1.matrix.translate(1, 0, 0);
    var fur = new Matrix4(eye2s1.matrix);
    eye2s1.render();
  
    var eye2s2 = new Cube();
    eye2s2.color = [1, 1, 1, 1];
    eye2s2.matrix = eyes2s2;
    eye2s2.matrix.translate(-0.1, -6, 0);
    eye2s2.matrix.scale(0.1, 5, 1);
    eye2s2.render();
  
    var patch = new Cube();
    patch.color= [1, 1, 1, 1];
    patch.matrix = fur;
    patch.matrix.translate(-1, 0, -2.5)
    patch.matrix.scale(6.5, 1, 1);
    patch.render();
  
    var nose = new Cube();
    nose.color = [0, 0, 0, 1];
    nose.matrix = nosecor;
    nose.matrix.translate(2.25, 6.5, -1.45);
    nose.matrix.scale(2, 1, 1);
    var nosepathcor = new Matrix4(nose.matrix);
    nose.render();
  
    var nosepatch = new Cube();
    nosepatch.color = [1, 1, 1, 1];
    nosepatch.matrix = nosepathcor;
    nosepatch.matrix.translate(-0.55, 0, -0.8);
    nosepatch.matrix.scale(2.1, 1, 1);
    nosepatch.render();
    
  
    var snout = new Cube();
    snout.color = [0.98, 0.50, 0.11, 1.0];
    snout.matrix = yellowCoordinates;
    snout.matrix.rotate(90, 1, 0, 0);
    snout.matrix.translate(0.175, 0.05, -1.3);
    snout.matrix.scale(.65, .30, .39);
    snout.render();
  
    var ears = new Cube();
    ears.color = [1, 1, 1, 1];
    ears.matrix = earss2;
    ears.matrix.rotate(90, 1, 0, 0);
    ears.matrix.scale(0.3, 0.3, 0.1);
    ears.matrix.translate(0, 3.35, -10.3);
    var secondears = new Matrix4(ears.matrix);
    var triears2 = new Matrix4(ears.matrix);
    ears.render();
  
    var triear2 = new TriangleP();
    triear2.color = [0.98, 0.50, 0.11, 0.1];
    triear2.matrix = triears2;
    triear2.matrix.translate(0.0, 1.0, 0);
    triear2.matrix.scale(1.0, 0.5, 1.0);
    triear2.render();
  
    var ears2 = new Cube();
    ears2.color = [1, 1, 1, 1];
    ears2.matrix = secondears;
    ears2.matrix.translate(2.37, 0, 0);
    var triears = new Matrix4(ears2.matrix);
    ears2.render();
  
    var triear1 = new TriangleP();
    triear1.color = [0.98, 0.50, 0.11, 0.1];
    triear1.matrix = triears;
    triear1.matrix.translate(0.0, 1.0, 0);
    triear1.matrix.scale(1.0, 0.5, 1.0);
    triear1.render();
  
    var tail = new Cube();
    tail.color = [0.98, 0.50, 0.11, 1.0];
    tail.matrix = tailcoordinates;
    tail.matrix.translate(.5, 0.12, 1.0);
    tail.matrix.scale(.8, .8, .5)
    // tail.matrix.rotate(g_yelloAngle, 0, 1, 0);
    // tail.matrix.rotate(g_magentaAngle/2, 0, 1, 0);
    tail.matrix.rotate(-tailJoint/2, 0, 1, 0);
    tail.matrix.translate(-.5,  0, 0);
    var tail2coordinates = new Matrix4(tail.matrix);
    tail.render();
  
    var tail2 = new Cube();
    tail2.color = [0.98, 0.50, 0.11, 0.1];
    tail2.matrix = tail2coordinates;
    tail2.matrix.translate(0.5, 0.11, 1.0);
    tail2.matrix.scale(0.8, 0.8, 1.2)
  //   tail2.matrix.rotate(180, 0, 0, 1);
  //   tail2.matrix.translate(-1, -1, 0);
  //   tail2.matrix.translate(0, 0, .2)
    // tail2.matrix.rotate(g_magentaAngle/2, 0, 1, 0);
    // tail2.matrix.rotate(g_yelloAngle, 0, 1, 0);
    tail2.matrix.rotate(-tailJoint2, 0, 1, 0);
    tail2.matrix.translate(-.5, 0, 0);
    var tail3coordinates = new Matrix4(tail2.matrix);
    tail2.render();
  
    var tail3 = new Cube();
    tail3.color = [1, 1, 1, 1];
    tail3.matrix = tail3coordinates;
    tail3.matrix.translate(0.5, 0, 0);
    tail3.matrix.scale(0.7, 0.7, 0.7);
    tail3.matrix.translate(0.15, 0.2, 1.3);
    // tail3.matrix.rotate(g_magentaAngle, 0, 1, 0);
    // tail3.matrix.rotate(g_yelloAngle, 0, 1, 0);
    tail3.matrix.rotate(-tailJoint3, 0, 1, 0);
    tail3.matrix.translate(-0.65, 0, 0);
    tail3.render();
  
  
    var foot = new Cube();
    foot.color = [0.98, 0.50, 0.11, 1.0];
    foot.matrix = feetcoordinates;
    foot.matrix.translate(0.9, -.52, 0.2);
    foot.matrix.scale(.3, .5, .2);
    foot.matrix.rotate(-90, 0, 0, 1);
    foot.matrix.translate(-1.6, -2.7, 0);
    var foot2Coordinates = new Matrix4(foot.matrix);
  //   foot.matrix.rotate(-90, 0, 1, 0);
  //   foot.matrix.translate(-0.5, 0, -1);
    // foot.matrix.rotate(g_footanimation, 0, 1, 0);
    foot.matrix.rotate(g_magentaAngle/2, 0, 1, 0);
    foot.matrix.scale(1.9, 1, 1);
    var footF = new Matrix4(foot.matrix);
    foot.render();
  
    var footfoot = new Cube();
    footfoot.color = [0, 0, 1, 1];
    footfoot.matrix = footF;
    footfoot.matrix.translate(0.8, -0.1, -0.1);
    footfoot.matrix.scale(0.3, 1.2, 1.2);
    footfoot.render();
  
    var foot2 = new Cube();
    foot2.color = [0.98, 0.50, 0.11, 1.0];
    foot2.matrix = foot2Coordinates;
    foot2.matrix.translate(0.0, 1.8, 0);
    var foot3Coordinates = new Matrix4(foot2.matrix);
    // foot2.matrix.rotate(-g_footanimation, 0, 1, 0);
    foot2.matrix.rotate(-g_magentaAngle/2, 0, 1, 0);
    foot2.matrix.scale(1.9, 1, 1);
    var footF2 = new Matrix4(foot2.matrix);
    foot2.render();
  
    var footfoot2 = new Cube();
    footfoot2.color = [0, 0, 1, 1];
    footfoot2.matrix = footF2;
    footfoot2.matrix.translate(0.8, -0.1, -0.1);
    footfoot2.matrix.scale(0.3, 1.2, 1.2);
    footfoot2.render();
  
    var foot3 = new Cube();
    foot3.color = [0.98, 0.50, 0.11, 1.0];
    foot3.matrix = foot3Coordinates;
    foot3.matrix.translate(0.0, 0.0, 2.5);
    var foot4Coordinates = new Matrix4(foot3.matrix);
    // foot3.matrix.rotate(g_footanimation, 0, 1, 0);
    foot3.matrix.rotate(g_magentaAngle/2, 0, 1, 0);
    foot3.matrix.scale(1.9, 1, 1);
    var footF3 = new Matrix4(foot3.matrix);
    foot3.render();
  
    var footfoot3 = new Cube();
    footfoot3.color = [0, 0, 1, 1];
    footfoot3.matrix = footF3;
    footfoot3.matrix.translate(0.8, -0.1, -0.1);
    footfoot3.matrix.scale(0.3, 1.2, 1.2);
    footfoot3.render();
  
    var foot4 = new Cube();
    foot4.color = [0.98, 0.50, 0.11, 1.0];
    foot4.matrix = foot4Coordinates;
    foot4.matrix.translate(0.0, -1.8, 0);
    // foot4.matrix.rotate(-g_footanimation, 0, 1, 0);
    foot4.matrix.rotate(-g_magentaAngle/2, 0, 1, 0);
    foot4.matrix.scale(1.9, 1, 1);
    var footF4 = new Matrix4(foot4.matrix);
    foot4.render();
  
    var footfoot4 = new Cube();
    footfoot4.color = [0, 0, 1, 1];
    footfoot4.matrix = footF4;
    footfoot4.matrix.translate(0.8, -0.1, -0.1);
    footfoot4.matrix.scale(0.3, 1.2, 1.2);
    footfoot4.render();
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

