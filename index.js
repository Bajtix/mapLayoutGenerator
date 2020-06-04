
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

class RoomRect
{
    constructor(x,y,xd,yd,label,color,txtcolor)
    {
        this.x = x;
        this.y = y;
        this.xd = xd;
        this.yd = yd;
        this.cursorOnMe = false;
        this.label = label;
        this.color = color;
        this.txtcolor = txtcolor;
    }



    draw() 
    {
        ctx.fillStyle = this.color;
        ctx.textAlign = "center";
        ctx.fillRect((this.x + camX)*scrollPos,(this.y+ camY)*scrollPos,(this.xd-this.x)*scrollPos,(this.yd-this.y)*scrollPos);
        ctx.fillStyle = this.txtcolor;
        ctx.fillText(this.label, ((this.x + this.xd)/2 + camX)*scrollPos, ((this.y + this.yd)/2 + camY) *scrollPos); 
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
        //ctx.fillStyle = 'rgba(255,255,255,1)';
        rects.push(new RoomRect((mouseX/scrollPos-camX),(mouseY/scrollPos-camY),mouseX+10-camX,mouseY+10-camY,"",setcolor,settcolor));
        controlledRect = rects.length-1;
        //rects[controlledRect].label = "Room " + controlledRect;
    }

    if(tool==1)
    {
        if(controlledRect == undefined){
            for(i = 0; i < rects.length; i++)
            {
                if(rects[i] != undefined){
                    if(rects[i].checkForCursor(mouseX,mouseY))
                    {
                        controlledRect = i;

                        console.log("selected rect")
                    }
                }
            }
        }
        else 
            console.log("undefined");
    }

    if(tool==2)
    {
        if(controlledRect == undefined){
            for(i = 0; i < rects.length; i++)
            {
                if(rects[i] != undefined)
                {
                    if(rects[i].checkForCursor(mouseX,mouseY))
                    {
                        if(confirm("Are you sure you want to delete: " + rects[i].label))
                        {
                            rects.splice(i,1);
                        }
                    }
                }
            }
        }
        else 
            console.log("undefined");
    }

    if(tool == 3)
    {
        if(controlledRect == undefined){
            for(i = 0; i < rects.length; i++)
            {
                if(rects[i] != undefined)
                {
                    if(rects[i].checkForCursor(mouseX,mouseY))
                    {
                        rects[i].label = prompt("Change name of " + rects[i].label + ":",rects[i].label);
                    }
                }
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
                        rects[controlledRect].yd = (mouseY/scrollPos-handleSize/2 - camY);
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

    

    if(mouseDown == true)
    {
        // cursor ctx.fillRect(mouseX-5,mouseY-5,10,10);
    }

    for(i = 0; i < rects.length; i++)
    {
        if(rects[i]!=undefined)
        {
            rects[i].draw();       
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



document.addEventListener("mousedown", e => {onMouseDown(e)});
document.addEventListener("mouseup", e => {onMouseUp(e)});
document.addEventListener("mouseout", e => {onMouseUp(e)});
document.addEventListener("mousemove", e => {onMouseMove(e)});
document.addEventListener('wheel', e => {onScroll(e);});
document.addEventListener('keydown', e => {onKeydown(e);});


requestAnimationFrame(mainLoop);