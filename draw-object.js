let min = 99;
let max = 999999;
let polygonMode = false;
let pointArray = [];
let lineArray = [];
let activeLine;
let activeShape;

window.onload = function(e){ 
   prototypefabric.initPolyDraw();
   document.getElementById("create-polygon")
      .addEventListener("click", function() {
         prototypefabric.polygon.drawPolygon(); 
         document.getElementById("cancel-polygon").style.display = "inline" 
         document.getElementById("create-polygon").style.display = "none"
      });
   document.getElementById("create-circle")
      .addEventListener("click", function() {
         prototypefabric.circle.drawCircle(); 
      });
   document.getElementById("create-rect")
      .addEventListener("click", function() {
         prototypefabric.rect.drawRect(); 
      });
};

let prototypefabric = new function () {
    this.initPolyDraw = function () {
        canvas.on('mouse:down', function (options) {
            if (options.target?.type === 'polyPoint' || options.target?.type === 'polygon' || options.target?.type === undefined) {
              if(options.target && options.target.id == pointArray[0].id){
                  prototypefabric.polygon.generatePolygon(pointArray);
              }
              if(polygonMode){
                  prototypefabric.polygon.addPoint(options);
              }
            }
        });
        canvas.on('mouse:move', function (options) {
            if (options.target?.type === 'polyPoint') {
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
            }
        });
    };
};

prototypefabric.polygon = {
    drawPolygon : function() {
        polygonMode = true;
        pointArray = [];
        lineArray = [];
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
            type: 'polyPoint',
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
                evented: false,
                type: 'activeShape'
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
            stroke:'none',
            strokeWidth: 0,
            fill: 'rgba(96, 156, 182, 0.7)',
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
        document.getElementById("cancel-polygon").style.display = "none" 
        document.getElementById("create-polygon").style.display = "inline"
    }
};

prototypefabric.circle = {
  circleMode: false,
  drawCircle: function () {
    prototypefabric.circle.enableDraw()
    this.bindEvents();
  },
  bindEvents: function() {
    canvas.on('mouse:down', function(o) {
      if(prototypefabric.circle.isEnable()) {
        prototypefabric.circle.onMouseDown(o);
      }
    });
  },
  onMouseDown: function(o) {
    if (!prototypefabric.circle.isEnable()) {
      return;
    }
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;

    var circle = new fabric.Circle({
      top: origY,
      left: origX,
      transparentCorners: false,
      hasBorders: false,
      fill: 'rgb(107, 188, 255, 0.7)',
      radius: 12,
      strokeWidth: 0,
      scaleX: 1,           
      scaleY: 1,           
      objectCaching: false,
      transparentCorners: false,      
      hasBorders: false,   
      originX: 'center',   
      originY: 'center',
      index: canvas.getObjects().length
    });
    canvas.add(circle).setActiveObject(circle);
    canvas.renderAll();
    prototypefabric.circle.disableDraw() 
  },
  isEnable: function() {
    return prototypefabric.circle.circleMode;
  },
  enableDraw: function() {
    prototypefabric.circle.circleMode = true;
  },
  disableDraw: function() {
    prototypefabric.circle.circleMode = false;
  }
};

prototypefabric.rect = {
  rectMode: false,
  drawRect: function () {
    prototypefabric.rect.enableDraw()
    this.bindEvents();
  },
  bindEvents: function() {
    canvas.on('mouse:down', function(o) {
      if(prototypefabric.rect.isEnable()) {
        prototypefabric.rect.onMouseDown(o);
      }
    });
  },
  onMouseDown: function(o) {
    if (!prototypefabric.rect.isEnable()) {
      return;
    }
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;

    let rect = new fabric.Rect({
      top: origY,
      left: origX,
      fill: '#cccccc',
      width: 200,
      height: 5,
      objectCaching: false,
      stroke: 'none',
      strokeWidth: 0,
      index: canvas.getObjects().length
    });
    canvas.add(rect).setActiveObject(rect);
    canvas.renderAll();
    prototypefabric.rect.disableDraw() 
  },
  isEnable: function() {
    return prototypefabric.rect.rectMode;
  },
  enableDraw: function() {
    prototypefabric.rect.rectMode = true;
  },
  disableDraw: function() {
    prototypefabric.rect.rectMode = false;
  }
};
