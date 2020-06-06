/*
    Code by bajtix, 
    of course bits are taken from my other projects.
    ...And stackoverflow.

    Made in 06.2020
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var mouseX;
var mouseY;
var mouseDown;
var scrollPos = 1;

var setcolor = 'rgba(255,255,255,1)';
var settcolor = 'rgba(0,0,0,1)';

var controlledRect = undefined;
var rects = [];
var tool = 0;

var camX = 0;
var camY = 0;

const handleSize = 60;
const zoomMultiply = 0.01;
const mapText = `
versioninfo
{
	"editorversion" "400"
	"editorbuild" "8456"
	"mapversion" "4"
	"formatversion" "100"
	"prefab" "0"
}
visgroups
{
}
viewsettings
{
	"bSnapToGrid" "1"
	"bShowGrid" "1"
	"bShowLogicalGrid" "0"
	"nGridSpacing" "4"
	"bShow3DGrid" "0"
}
world
{
	"id" "1"
	"mapversion" "4"
	"classname" "worldspawn"
	"detailmaterial" "detail/detailsprites"
	"detailvbsp" "detail.vbsp"
	"maxpropscreenwidth" "-1"
	"skyname" "sky_dust"
	{solids}
}
cameras
{
	"activecamera" "-1"
}
cordons
{
	"active" "0"
}

`;//nice
const solidText = `solid
{
    "id" "{solidId}"
    side
    {
        "id" "{1FaceId}"
        "plane" "{c0} {c1} {c2}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[1 0 0 0] 0.25"
        "vaxis" "[0 -1 0 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    side
    {
        "id" "{2FaceId}"
        "plane" "{c3} {c4} {c5}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[1 0 0 0] 0.25"
        "vaxis" "[0 -1 0 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    side
    {
        "id" "{3FaceId}"
        "plane" "{c0} {c6} {c3}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[0 1 0 0] 0.25"
        "vaxis" "[0 0 -1 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    side
    {
        "id" "{4FaceId}"
        "plane" "{c5} {c4} {c2}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[0 1 0 0] 0.25"
        "vaxis" "[0 0 -1 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    side
    {
        "id" "{5FaceId}"
        "plane" "{c1} {c0} {c7}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[1 0 0 0] 0.25"
        "vaxis" "[0 0 -1 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    side
    {
        "id" "{6FaceId}"
        "plane" "{c4} {c3} {c6}"
        "material" "dev/dev_measuregeneric01"
        "uaxis" "[1 0 0 0] 0.25"
        "vaxis" "[0 0 -1 0] 0.25"
        "rotation" "0"
        "lightmapscale" "16"
        "smoothing_groups" "0"
    }
    editor
    {
        "color" "0 252 109"
        "visgroupshown" "1"
        "visgroupautoshown" "1"
    }
}`;
class Point3D
{
    constructor(x,y,z)
    {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = Math.round(z);
    }

    getAsString()
    {
        return "(" + this.x + " " + this.y + " " + this.z + ")";
    }
}

class Cube
{
    constructor(rect, height)
    {
        this.b1 = new Point3D(rect.x, rect.y, 0);
        this.b2 = new Point3D(rect.xd, rect.y, 0);
        this.b3 = new Point3D(rect.x, rect.yd, 0);
        this.b4 = new Point3D(rect.xd, rect.yd, 0);

        this.u1 = new Point3D(rect.x, rect.y, height);
        this.u2 = new Point3D(rect.xd, rect.y, height);
        this.u3 = new Point3D(rect.x, rect.yd, height);
        this.u4 = new Point3D(rect.xd, rect.yd, height);
    }
}

class RoomRect
{
    constructor(x,y,xd,yd,label,color,txtcolor,rotation)
    {
        this.x = x;
        this.y = y;
        this.xd = xd;
        this.yd = yd;
        this.cursorOnMe = false;
        this.label = label;
        this.color = color;
        this.txtcolor = txtcolor;
        this.rotation = rotation;
    }



    draw() 
    {
        ctx.save();
        ctx.translate(((this.x+this.xd)/2 +camX)*scrollPos,((this.y+this.yd)/2 +camY)*scrollPos);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        //ctx.fillRect((this.x + camX)*scrollPos,(this.y+ camY)*scrollPos,(this.xd-this.x)*scrollPos,(this.yd-this.y)*scrollPos);
        ctx.fillRect(-((this.xd-this.x)/2)*scrollPos,-((this.yd-this.y)/2)*scrollPos,(this.xd-this.x)*scrollPos,(this.yd-this.y)*scrollPos);
        ctx.fillStyle = this.txtcolor;
        //ctx.fillText(this.label, ((this.x + this.xd)/2 + camX)*scrollPos, ((this.y + this.yd)/2 + camY) *scrollPos); 
        ctx.fillText(this.label, 0, 0); 
        ctx.restore();
    }

    checkForCursor(mx,my)
    {
        if(mx >= (this.x + camX)*scrollPos && mx <= (this.xd + camX)*scrollPos)
        {
            if(my >= (this.y + camY)*scrollPos && my <= (this.yd + camY)*scrollPos)
            {
                return true;
            }
            else
            {
                console.log("Cursor y is in " + my + ", has to be in range of " + this.y + "::" + this.yd);
                return false;
            }
        }
        else
        {
            console.log("Cursor x is in " + mx + ", has to be in range of " + this.x + "::" + this.xd);
            return false;
        }
    }

    modificationMode()
    {
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
        ctx.fillRect((this.x + camX)*scrollPos,(this.y + camY)*scrollPos,-handleSize,-handleSize);
        ctx.fillRect((this.x+ camX)*scrollPos,(this.yd + camY)*scrollPos,-handleSize,handleSize);
        ctx.fillRect((this.xd+ camX)*scrollPos,(this.y + camY)*scrollPos,handleSize,-handleSize);
        ctx.fillRect((this.xd+ camX)*scrollPos,(this.yd + camY)*scrollPos,handleSize,handleSize);
        //ctx.fillStyle = 'rgba(255,255,255,1)';
    }
}

function changetool(i)
{
    controlledRect = undefined;
    tool=i;
}


function getRectangleAtMouse()
{
    for(i = 0; i < rects.length; i++)
    {
        if(rects[i] != undefined){
            if(rects[i].checkForCursor(mouseX,mouseY))
            {
                return i;
            }
        }
    }
    return undefined;
}


function onMouseDown(e)
{
    if(mouseX > canvas.getBoundingClientRect().right)
        return;
    if(mouseY > canvas.getBoundingClientRect().bottom)
        return;
    console.log("mouse down")
    mouseDown = true;
    
    if(tool == 0)
    {
        rects.push(new RoomRect((mouseX/scrollPos-camX),(mouseY/scrollPos-camY),mouseX+10-camX,mouseY+10-camY,"",setcolor,settcolor,0));
        controlledRect = rects.length-1;
    }

    if(tool==1)
    {
        if(controlledRect == undefined){
            controlledRect = getRectangleAtMouse();
        }
        else 
            console.log("undefined");
    }

    if(tool==2)
    {
        if(controlledRect == undefined)
        {               
            i = getRectangleAtMouse();    
            if(i!=undefined)    
                if(confirm("Are you sure you want do delete " + rects[i].label))
                    rects.splice(i,1);
        }
        else 
            console.log("undefined");
    }

    if(tool == 3)
    {
        if(controlledRect == undefined){
            i = getRectangleAtMouse()
            if(i != undefined)
            {
                rects[i].label = prompt("Change name of " + rects[i].label + ":",rects[i].label);
            }
        }
        else 
            console.log("undefined");
    }
}
function onMouseUp(e)
{
    mouseDown = false;

    if(tool == 0)
    {
        if(controlledRect != undefined)
        {
            rect = rects[controlledRect];

            if(rect.x > rect.xd)
            {
                tx = rect.x;
                rect.x = rect.xd;
                rect.xd = tx;
            }

            if(rect.y > rect.yd)
            {
                ty = rect.y;
                rect.y = rect.yd;
                rect.yd = ty;
            }

            if(Math.abs(rect.x - rect.xd) < 20)
            {
                rects.splice(controlledRect,1);
                controlledRect = undefined;
                return;
            }

            if(Math.abs(rect.y - rect.yd) < 20)
            {
                rects.splice(controlledRect,1);
                controlledRect = undefined;
                return;
            }
        }
        controlledRect = undefined;
    }
}
function onMouseMove(e)
{
    mouseX = e.clientX - canvas.getBoundingClientRect().left;
    mouseY = e.clientY - canvas.getBoundingClientRect().top;  
    if(tool == 0)
    {
        if(controlledRect != undefined)
        {
            rects[controlledRect].xd = mouseX/scrollPos-camX;
            rects[controlledRect].yd = mouseY/scrollPos-camY;
        }
    }

    if(tool == 1)
    {
        if(controlledRect != undefined)
        {
            rect = rects[controlledRect];

            //handle 1 :  top left
            if(mouseX >= (rect.x + camX)*scrollPos - handleSize && mouseX <= (rect.x + camX)*scrollPos)
            {
                if(mouseY >= (rect.y + camY)*scrollPos - handleSize  && mouseY <= (rect.y + camY)*scrollPos)
                {
                    if(mouseDown)
                    {
                        rects[controlledRect].x = (mouseX/scrollPos+handleSize/2 - camX);
                        rects[controlledRect].y = (mouseY/scrollPos+handleSize/2 - camY);
                    }
                } 
            }

            //handle 2 :  bottom left
            if(mouseX >= (rect.x + camX)*scrollPos - handleSize && mouseX <= (rect.x + camX)*scrollPos)
            {
                if(mouseY >= (rect.yd + camY)*scrollPos && mouseY <= (rect.yd + camY)*scrollPos + handleSize)
                {
                    if(mouseDown)
                    {
                        rects[controlledRect].x = (mouseX/scrollPos+handleSize/2 - camX);
                        rects[controlledRect].yd = (mouseY/scrollPos-handleSize/2 - camY);
                    }
                } 
            }

            //handle 3 :  top right
            if(mouseX >= (rect.xd + camX)*scrollPos && mouseX <= (rect.xd + camX)*scrollPos + handleSize)
            {
                if(mouseY >= (rect.y + camY)*scrollPos - handleSize && mouseY <= (rect.y + camY)*scrollPos)
                {
                    if(mouseDown)
                    {
                        rects[controlledRect].xd = (mouseX/scrollPos-handleSize/2 - camX);
                        rects[controlledRect].y = (mouseY/scrollPos+handleSize/2 -camY);
                    }
                } 
            }

            //handle 4 :  bottom right
            if(mouseX >= (rect.xd + camX)*scrollPos && mouseX <= (rect.xd + camX)*scrollPos + handleSize)
            {
                if(mouseY >= (rect.yd + camY)*scrollPos && mouseY <= (rect.yd + camY)*scrollPos + handleSize)
                {
                    if(mouseDown)
                    {
                        rects[controlledRect].xd = (mouseX/scrollPos-handleSize/2 - camX);
                        rects[controlledRect].yd = (mouseY/scrollPos-handleSize/2 - camY); //hehe fajna linijka
                    }
                } 
            }
        }
    }

    if(tool == -1)
    {
        camX = mouseX;
        camY = mouseY;
    }
}

function onScroll(event)
{
    scrollPos += event.deltaY * zoomMultiply;
    console.log(scrollPos);

    camX += scrollPos;
    camY += scrollPos;
}

function onKeydown(evnet)
{
    console.log(event.keyCode);
    if(event.keyCode == 39)
    {        
        camX -= 10;
    }
    if(event.keyCode == 37)
    {
        camX += 10;
    }
    if(event.keyCode == 38)
    {
        camY += 10;
    }
    if(event.keyCode == 40)
    {
        camY -= 10;
    }
}

function mainLoop()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = 'rgba(0,128,255,1)' this draws a rect at 0 0
    //ctx.fillRect(-20 +camX,-20 +camY,40,40);

    for(i = 0; i < rects.length; i++)
    {
        if(rects[i]!=undefined)
        {
            rects[i].draw();   
            console.log("loop");    
        }
        else
        {
            console.warn("rect undefined");
        }
    }

    if(tool==1)
    {
        if(controlledRect!=undefined)
        {
            rects[controlledRect].modificationMode();
        }
    }
    
    requestAnimationFrame(mainLoop);
}

function move()
{
    camX = prompt("X");
    camY = prompt("Y");
}


function load(contents)
{
    unsolved_rects = JSON.parse(contents);
    for(i = 0; i < unsolved_rects.length; i++)
    {
        rects.push(new RoomRect(unsolved_rects[i].x,unsolved_rects[i].y,unsolved_rects[i].xd,unsolved_rects[i].yd,unsolved_rects[i].label,unsolved_rects[i].color,unsolved_rects[i].txtcolor));   
    }
}

function ldo()
{
    document.getElementById("fileload").click();
}
function readSingleFile(e) 
{
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        load(contents);
    };
    reader.readAsText(file);

    requestAnimationFrame(mainLoop);
}

function save()
{
    content = JSON.stringify(rects);
    data = new Blob([content], {type: 'application/json'});
    download(data,"map.layout");
}


function download(blob,name) 
{
    var url = URL.createObjectURL(blob),
      div = document.createElement("div"),
      anch = document.createElement("a");

    document.body.appendChild(div);
    div.appendChild(anch);

    anch.innerHTML = "&nbsp;";
    div.style.width = "0";
    div.style.height = "0";
    anch.href = url;
    anch.download = name;

    var ev = new MouseEvent("click",{});
    anch.dispatchEvent(ev);
    document.body.removeChild(div);
}

function exportmap()
{
    console.log("Exporting the map!");
    console.log("Step 1: define cubes");
    cubes = [];

    for(i = 0; i < rects.length; i++)
    {
        cubes.push(new Cube(rects[i],128));
    }

    console.log("Cubes were generated.");

    alltxt = "";
    
    for(solidIds = 0; solidIds < cubes.length; solidIds++)
    {
        //replace ids;
        side = solidText
        .replace("{solidId}",solidIds)
        .replace("{1FaceId}",solidIds*6 + 0)
        .replace("{2FaceId}",solidIds*6 + 1)
        .replace("{3FaceId}",solidIds*6 + 2)
        .replace("{4FaceId}",solidIds*6 + 3)
        .replace("{5FaceId}",solidIds*6 + 4)
        .replace("{6FaceId}",solidIds*6 + 5);

        
        //set faces
        side = side
        .replace(/{c0}/g, cubes[solidIds].u3.getAsString())
        .replace(/{c1}/g, cubes[solidIds].u4.getAsString())
        .replace(/{c2}/g, cubes[solidIds].u2.getAsString())
        .replace(/{c3}/g, cubes[solidIds].b1.getAsString())
        .replace(/{c4}/g, cubes[solidIds].b2.getAsString())
        .replace(/{c5}/g, cubes[solidIds].b4.getAsString())
        .replace(/{c6}/g, cubes[solidIds].u1.getAsString())
        .replace(/{c7}/g, cubes[solidIds].b3.getAsString());

        alltxt = alltxt + "\n" + side;
    }
    mapFile = mapText.replace("{solids}",alltxt)
    console.log(mapFile);
    data = new Blob([mapFile], {type: 'application/json'});
    download(data,"map.vmf")
}

document.addEventListener("mousedown", e => {onMouseDown(e)});
document.addEventListener("mouseup", e => {onMouseUp(e)});
document.addEventListener("mouseout", e => {onMouseUp(e)});
document.addEventListener("mousemove", e => {onMouseMove(e)});
document.addEventListener('wheel', e => {onScroll(e);});
document.addEventListener('keydown', e => {onKeydown(e);});
document.getElementById("fileload").addEventListener('change',readSingleFile,false);

requestAnimationFrame(mainLoop);