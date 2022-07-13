let selectedObject;

const getSize = (obj, bgScaledWidth, bgScaledHeight) => ({
  width: 100 * ((obj.width * obj.scaleX) / bgScaledWidth),
  height: 100 * ((obj.height * obj.scaleY) / bgScaledHeight),
})

canvas.on('mouse:dblclick', function (event) {
    if (bgScaledWidth && bgScaledHeight) {
      if (event.target) {
        let coordinates = {}
        let markerCoordinates = {}
        let markerSize = {}
        let rectCoordinates = {}
        let rectSize = {}
        let points = {}
        let size = {}
        let rectAngle = 0 
        if (event.target.type === 'group') {
          coordinates = {
            x: 100 * (event.target.left / bgScaledWidth),
            y: 100 * (event.target.top / bgScaledHeight),
          }
          event.target?.forEachObject(obj => {
              if (obj.type === 'rect') {
                rectSize = getSize(obj,bgScaledWidth,bgScaledHeight)
                rectAngle = obj.angle
                rectCoordinates = {
                  x: 100 * (obj.left / bgScaledWidth),
                  y: 100 * (obj.top / bgScaledHeight),
                }
              }
              if (obj.type === 'polygon') {
                size = getSize(obj,bgScaledWidth,bgScaledHeight)
                points =  obj.points;
              }
              if (obj.type === 'circle') {
                 markerSize = getSize(obj,bgScaledWidth,bgScaledHeight)
                 markerCoordinates = {
                   x: 100 * (obj.left / bgScaledWidth),
                   y: 100 * (obj.top / bgScaledHeight),
                 }
              }
          })
          console.log({ 
            coordinates, 
            points, 
            markerCoordinates, 
            size, 
            markerSize,
            rectSize,
            rectCoordinates,
            rectAngle, 
          })
        } else {
          console.log(
            {
              points: event.target.points,
              coordinates: {
                x: 100 * (event.target.left / bgScaledWidth),
                y: 100 * (event.target.top / bgScaledHeight),
              },
              size: getSize(event.target, bgScaledWidth,bgScaledHeight),
              angle: event.target.angle
            }
          )
        }
      }  
    } else {
        alert('This function requires you to load a background.')
    }
});
canvas.on('mouse:down', function (event) {
   if (!isNaN(event.target?.index)) {
      if (event.target?.type === 'polygon') {
         document.getElementById('object-controller').style.display = 'block'
      } else {
         document.getElementById('general-controller').style.display = 'block'
      }
      document.getElementById('drag-controller').style.display = 'block'
      selectedObject = event.target?.index
   } else {
      document.getElementById('object-controller').style.display = 'none' 
      document.getElementById('general-controller').style.display = 'none'
      document.getElementById('drag-controller').style.display = 'none'
      selectedObject = undefined;
   }
});

function polygonPositionHandler(dim, finalMatrix, fabricObject) {
    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
    y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
    return fabric.util.transformPoint(
        { x: x, y: y },
        fabric.util.multiplyTransformMatrices(
            fabricObject.canvas.viewportTransform,
            fabricObject.calcTransformMatrix()
        )
    );
}

function actionHandler(eventData, transform, x, y) {
    let polygon = transform.target,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
    polygonBaseSize = polygon._getNonTransformedDimensions(),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
    };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
}

function anchorWrapper(anchorIndex, fn) {
  return function(eventData, transform, x, y) {
    let fabricObject = transform.target,
        absolutePoint = fabric.util.transformPoint({
            x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
            y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
        }, fabricObject.calcTransformMatrix()),
        actionPerformed = fn(eventData, transform, x, y),
        newDim = fabricObject._setPositionDimensions({}),
        polygonBaseSize = fabricObject._getNonTransformedDimensions(),
        newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
            newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
    return actionPerformed;
  }
}

function ClearCanvas() {
  cancelPolyDraw()
  canvas.getObjects().forEach((obj) => {
     canvas.remove(obj) 
  })
  canvas.requestRenderAll();
}

function Delete() {
  if (!isNaN(selectedObject)) {
      canvas.getObjects().forEach((obj) => {
         if (selectedObject === obj.index) {
            canvas.remove(obj) 
            document.getElementById('object-controller').style.display = 'none'
            document.getElementById('general-controller').style.display = 'none'
            document.getElementById('drag-controller').style.display = 'none'
         }
      })
  }
}

function ToggleGroupEvents(toggle) {
  if (canvas.getObjects().length > 0) {
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'group') {
        obj.set({
          selectable: toggle,
          hasControls: toggle,
          evented: toggle
        })
      }
    })
    canvas.requestRenderAll();
    if (toggle) {
      alert('Group events have been Enabled')
    } else {
      alert('Group events have been Disabled')
    }
  }
  
}

function Edit() {
    if (!isNaN(selectedObject) && canvas.getObjects().length > 0) {
      let poly = canvas.getObjects()[selectedObject];
      canvas.setActiveObject(poly);
      if (poly.type === 'polygon') {
        poly.edit = !poly.edit;
        if (poly.edit) {
            let lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function(acc, point, index) {
                acc['p' + index] = new fabric.Control({
                    positionHandler: polygonPositionHandler,
                    actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }, { });
        } else {
            poly.cornerColor = 'blue';
            poly.cornerStyle = 'rect';
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
      } else {
        alert('You can only transform poly Objects')
      }
    }
}

function EditColor() {
    if (!isNaN(selectedObject) && canvas.getObjects().length > 0) {
      let color = prompt('Please enter a valid color value (hex, rgb, color)')
      if (color) {
          let activeOject = canvas.getObjects()[selectedObject];
          canvas.setActiveObject(activeOject);
          activeOject.set({ fill: color, stroke: color })
          canvas.renderAll();
      }
    }
}

function cancelPolyDraw() {
    polygonMode = false;
    pointArray = [];
    lineArray = [];
    activeLine = null;
    activeShape = null;
    canvas.getObjects().forEach((obj) => {
       if (obj.type === 'polyPoint' || obj.type === 'line' || obj.type === 'activeShape') {
          canvas.remove(obj) 
       }
    })
    document.getElementById("cancel-polygon").style.display = "none" 
    document.getElementById("create-polygon").style.display = "inline"
}

function createGroup() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
        return;
    }
    const newGroup = canvas.getActiveObject().toGroup();
    newGroup.set({
      index: canvas.getObjects().length - 1
    })
    canvas.requestRenderAll();
    alert('Selected objects have been grouped')
}

function unGroup() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'group') {
        return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
    alert('Selected objects have been un grouped')
}
