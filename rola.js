var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];
var keysPressed = {};

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var time = 0;

var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.6 , 0.8, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    window.addEventListener("keydown", function(e){
        keysPressed[e.key] = true;
        e.preventDefault();
    });
    window.addEventListener("keyup", function(e){
        keysPressed[e.key] = false;
    });


    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [0.9686, 0.7098, 0.5961, 1.0  ],  // red
        [ 0.6392, 0.8667, 0.8745, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.6392, 0.8667, 0.8745, 1.0  ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];


    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}

function spinModel() {
    if (keysPressed["ArrowLeft"]) {
        spinY -= 1;
    }
    if (keysPressed["ArrowRight"]) {
        spinY += 1;
    }
    if (keysPressed["ArrowUp"]) {
        spinX += 1;
    }
    if (keysPressed["ArrowDown"]) {
        spinX -= 1;
    }
}

function render()
{
 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 var mv = mat4();
 mv = mult(mv,rotateX(spinX));
 mv = mult(mv,rotateY(spinY));

 const rotation = Math.sin(time) * 30;

//base
 var mv1 = mult(mv, translate(0.0, 0.5, 0.0));
 var mv1 = mult(mv1, rotateX(180));
 mv1 = mult(mv1, scalem(1.0, 0.1, 0.3));
 gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
 gl.drawArrays(gl.TRIANGLES,0,numVertices);

//vinstri fotur

var mv2 = scalem(0.05, 1.0, 0.05);
    mv2 = mult(translate(-0.45, 0, 0.0), mv2);
    mv2 = mult(mv, mv2);

gl.uniformMatrix4fv(matrixLoc, 0, flatten(mv2));
gl.drawArrays(gl.TRIANGLES, 0, numVertices);

//hægri fotur
var mv3 = scalem(0.05, 1.0, 0.05);
    mv3 = mult(translate(0.45, 0, 0), mv3);
    mv3 = mult(mv, mv3);
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mv3));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
   
// rolu band

    mv4 = scalem(0.01, 0.6, 0.01);
    mv4 = mult(translate(0, -0.5, 0), mv4);
    mv4 = mult(rotateX(rotation), mv4); 
    mv4 = mult(translate(0.2, 0.7, 0),mv4);
    mv4 = mult(mv, mv4);
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mv4));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    mv5 = scalem(0.01, 0.6, 0.01);
    mv5 = mult(translate(0, -0.5, 0), mv5);
    mv5 = mult(rotateX(rotation), mv5); 
    mv5 = mult(translate(-0.2, 0.7, 0),mv5);
    mv5 = mult(mv, mv5);
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mv5));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

//rolu botn
    mv6 = scalem(0.5, 0.05, 0.2);
    mv6 = mult(translate(0, -0.8, 0), mv6);
    mv6 = mult(rotateX(rotation), mv6); 
    mv6 = mult(translate(0.0, 0.7, 0),mv6);
    mv6 = mult(mv, mv6);
    gl.uniformMatrix4fv(matrixLoc, 0, flatten(mv6));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

 time += 0.05;
 
 requestAnimFrame(render);
}
