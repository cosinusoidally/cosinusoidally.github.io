// this two functions were promoted to be global
// to make firefoxs jit happy - URGH
function clamp(x, min, max) {
    if(x < min) return min;
    if(x > max) return max-1;
    return x;
}
tick=true;
// this is basically where the magic happens
function drawLight(canvas, ctx, normals, textureData, shiny, specularity, lx, ly, lz) {
// **me** Shouldn't really call this each frame
 if(typeof imgData==="undefined"){
    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
 }
    data = imgData.data;
    var i = 0;
    var ni = 0;
    var dx = 0, dy = 0, dz = 0;
nx=1;ny=1;nz=1;
var width=canvas.width;
var height=canvas.height;    
for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {

            // get surface normal

            nx = normals[ni];
            ny = normals[ni+1];
            nz = normals[ni+2];

            // make it a bit faster by only updateing the direction
            // for every other pixel
            if(shiny > 0 || (ni&1) == 0){
                // calculate the light direction vector
                dx = lx - x;
                dy = ly - y;
                dz = lz;

                // normalize it
                magInv = 1.0/Math.sqrt(dx*dx + dy*dy + dz*dz);
                dx *= magInv;
                dy *= magInv;
                dz *= magInv;
          }
            // take the dot product of the direction and the normal
            // to get the amount of specularity
            var dot = dx*nx + dy*ny + dz*nz;
//            var spec = 1;
            var spec = Math.pow(dot, 20)*specularity;
//            spec += Math.pow(dot, 400)*shiny;
            // spec + ambient
            var intensity = spec + 0.5;


            for(var channel = 0; channel < 3; channel++) {
                data[i+channel] = textureData[i+channel]*intensity;
            }
            i += 4;
            ni += 3;
        }
    }
   ctx.putImageData(imgData, 0, 0);
}


function normalmap(canvasId, texture, normalmap, specularity, shiny) {

    var canvas = document.getElementById(canvasId);
    if(canvas.getContext == undefined) {
        document.write('unsupported browser');
        return;
    }

    var ctx = canvas.getContext('2d');

    var normalData = null;
    var textureData = null;

    function getDataFromImage(img) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0 ,0);
        return ctx.getImageData(0, 0, img.width, img.height);
    }

    function loadImage(src, callback) {
        var img = document.createElement('img');
        img.onload = callback;
        img.src = src;
        return img;
    }

    var normals = [];
    var textureData = null;
var index=0;
    var normalsImg = loadImage(normalmap, function() {
        var data = getDataFromImage(normalsImg).data;
        // precalculate the normals
        for(var i = 0; i < canvas.height*canvas.width*4; i+=4) {
            var nx = data[i];
            // flip the y value
            var ny = 255-data[i+1];
            var nz = data[i+2];

            // normalize
            var magInv = 1.0/Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx *= magInv;
            ny *= magInv;
            nz *= magInv;

            normals[index++]=nx;
            normals[index++]=ny;
            normals[index++]=nz;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var textureImg = loadImage(texture, function() {
            textureData = getDataFromImage(textureImg).data;
            main();
        });

    });


    function main() {
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        var rect = canvas.getBoundingClientRect();
mx=0;
my=0;
        canvas.onmousemove = function(e) {
mx= e.clientX+50;
my= e.clientY+50;
        }
redraw = function() {
            drawLight(canvas, ctx, normals, textureData, shiny, specularity,mx, my, 100);
requestAnimationFrame(redraw);
        }
requestAnimationFrame(redraw);
    }
}
