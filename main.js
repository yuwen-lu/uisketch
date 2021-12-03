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
  div.style.position = "absolute";
  div.style.top = selectedFrame.top + "px";
  div.style.left = selectedFrame.left + "px";
  div.style.bottom = selectedFrame.bottom + "px";
  div.style.right = selectedFrame.right + "px";
  div.style.border = "5px solid red";

  console.log(div);
  document.querySelector('body').appendChild(div);
}

// Get cursor position, when drag starts
dragSelect.subscribe('dragstart', (e) => {
  // console.log(e);
  cursorStartX = dragSelect.getCurrentCursorPosition()['x'];
  cursorStartY = dragSelect.getCurrentCursorPosition()['y'];
})

// Get cursor position, when drag ends
dragSelect.subscribe('callback', (e) => {
  // console.log(e);
  cursorEndX = dragSelect.getCurrentCursorPosition()['x'];
  cursorEndY = dragSelect.getCurrentCursorPosition()['y'];

  // compute the selected portion of the img
  var selectedFrame = computeSelected(cursorStartX, cursorStartY, cursorEndX, cursorEndY);
  drawSelectionBox(selectedFrame);
})
