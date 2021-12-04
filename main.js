// Drag Selection
var DragSelect = require('dragselect');

let dragSelect = new DragSelect({
    selectables: document.getElementsByClassName('selectable-nodes')
});


// first, get image coordinates so we can compare with the cursor positions
var sketchImg = document.getElementById("sketch-img");
var rect = sketchImg.getBoundingClientRect();

var cursorStartX, cursorStartY, cursorEndX, cursorEndY;

// get the sketch image position every time the window changes
window.addEventListener('resize', () => {
  rect = sketchImg.getBoundingClientRect();
})

// define the function for computing the selected portion,
// return an object with coordinates of the selected area
let computeSelected = (cursorStartX, cursorStartY, cursorEndX, cursorEndY) => {
  var selectedFrame = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  // for left and top, we will take the bigger value
  selectedFrame.left = cursorStartX >= rect.left ? cursorStartX : rect.left;
  selectedFrame.top = cursorStartY >= rect.top ? cursorStartY : rect.top;

  // for bottom and right, we will take the smaller value
  selectedFrame.right = cursorEndX >= rect.right ? rect.right : cursorEndX;
  selectedFrame.bottom = cursorEndY >= rect.bottom ? rect.bottom : cursorEndY;

  console.log("Selected Frame: ");
  console.log(selectedFrame);
  return selectedFrame;
}

// draw a frame around selected box
let drawSelectionBox = (selectedFrame) => {
  var div = document.createElement("div");
  div.setAttribute("class", "selection-box");
  div.style.position = "absolute";
  div.style.top = selectedFrame.top + "px";
  div.style.left = selectedFrame.left + "px";
  div.style.bottom = (window.innerHeight - selectedFrame.bottom) + "px";
  div.style.right = (window.innerWidth - selectedFrame.right) + "px";

  console.log(div);
  document.querySelector('body').appendChild(div);

  // clean up the variables
  selectedFrame = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };
}

// Get cursor position, when drag starts
dragSelect.subscribe('dragstart', (e) => {
  // console.log(e);
  cursorStartX = dragSelect.getCurrentCursorPosition()['x'];
  cursorStartY = dragSelect.getCurrentCursorPosition()['y'];

  console.log("cursorStartX: " + cursorStartX + ", cursorStartY: " + cursorStartY);
})

// Get cursor position, when drag ends
dragSelect.subscribe('callback', (e) => {
  // console.log(e);
  cursorEndX = dragSelect.getCurrentCursorPosition()['x'];
  cursorEndY = dragSelect.getCurrentCursorPosition()['y'];
  console.log("cursorEndX: " + cursorEndX + ", cursorEndY: " + cursorEndY);
  
  // If the starting point is different from the end point,
  // compute the selected portion of the img
  if (cursorStartX != cursorEndX || cursorStartY != cursorEndY) {
    var selectedFrame = computeSelected(cursorStartX, cursorStartY, cursorEndX, cursorEndY);
    drawSelectionBox(selectedFrame);
  }
})
