let min = 99;
let max = 999999;
let polygonMode = false;
let pointArray = new Array();
let lineArray = new Array();
let activeLine;
let activeShape = false;

window.onload = function(e){ 
   prototypefabric.initPolyDraw();
   document.getElementById("create-polygon")
      .addEventListener("click", function() {
         prototypefabric.polygon.drawPolygon(); 
      });
};

let prototypefabric = new function () {
    this.initPolyDraw = function () {
        canvas.on('mouse:down', function (options) {
            if(options.target && options.target.id == pointArray[0].id){
                prototypefabric.polygon.generatePolygon(pointArray);
            }
            if(polygonMode){
                prototypefabric.polygon.addPoint(options);
            }
        });
        canvas.on('mouse:move', function (options) {
            if(activeLine && activeLine.class == "line"){
                let pointer = canvas.getPointer(options.e);
                activeLine.set({ x2: pointer.x, y2: pointer.y });

                let points = activeShape.get("points");
                points[pointArray.length] = {
                    x:pointer.x,
                    y:pointer.y
                }
                activeShape.set({
                    points: points
                });
                canvas.renderAll();
            }
            canvas.renderAll();
        });
    };
};

prototypefabric.polygon = {
    drawPolygon : function() {
        polygonMode = true;
        pointArray = new Array();
        lineArray = new Array();
        activeLine;
    },
    addPoint : function(options) {
        let random = Math.floor(Math.random() * (max - min + 1)) + min;
        let id = new Date().getTime() + random;
        let circle = new fabric.Circle({
            radius: 5,
            fill: '#ffffff',
            stroke: '#333333',
            strokeWidth: 0.5,
            left: (options.e.layerX/canvas.getZoom()),
            top: (options.e.layerY/canvas.getZoom()),
            selectable: false,
            hasBorders: false,
            hasControls: false,
            originX:'center',
            originY:'center',
            id:id
        });
        if(pointArray.length == 0){
            circle.set({
                fill:'blue'
            })
        }
        let points = [(options.e.layerX/canvas.getZoom()),(options.e.layerY/canvas.getZoom()),(options.e.layerX/canvas.getZoom()),(options.e.layerY/canvas.getZoom())];
        line = new fabric.Line(points, {
            strokeWidth: 2,
            fill: '#999999',
            stroke: '#999999',
            class:'line',
            originX:'center',
            originY:'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
        });
        if(activeShape){
            let pos = canvas.getPointer(options.e);
            let points = activeShape.get("points");
            points.push({
                x: pos.x,
                y: pos.y
            });
            let polygon = new fabric.Polygon(points,{
                stroke:'#333333',
                strokeWidth:1,
                fill: '#cccccc',
                opacity: 0.3,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });
            canvas.remove(activeShape);
            canvas.add(polygon);
            activeShape = polygon;
            canvas.renderAll();
        }
        else{
            let polyPoint = [{x:(options.e.layerX/canvas.getZoom()),y:(options.e.layerY/canvas.getZoom())}];
            let polygon = new fabric.Polygon(polyPoint,{
                stroke:'#333333',
                strokeWidth:1,
                fill: '#cccccc',
                opacity: 0.3,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });
            activeShape = polygon;
            canvas.add(polygon);
        }
        activeLine = line;

        pointArray.push(circle);
        lineArray.push(line);

        canvas.add(line);
        canvas.add(circle);
        canvas.selection = false;
    },
    generatePolygon : function(pointArray){
        let points = new Array();
        pointArray.forEach((point, index) => {
            points.push({
                x:point.left,
                y:point.top
            });
            canvas.remove(point);
        })
        lineArray.forEach((line, index) => {
            canvas.remove(line);
        })
        canvas.remove(activeShape).remove(activeLine);
        let polygon = new fabric.Polygon(points,{
            stroke:'#333333',
            strokeWidth: 0.5,
            fill: 'rgba(255, 255, 255, 0.5)',
            opacity: 1,
            hasBorders: false,
            objectCaching: false,
            index: canvas.getObjects().length
        });
        canvas.add(polygon);
        activeLine = null;
        activeShape = null;
        polygonMode = false;
        canvas.selection = true;
    }
};
