// Drag Selection
var DragSelect = require("dragselect");

let dragSelect = new DragSelect({
  selectables: document.getElementsByClassName("selectable-nodes"),
});

// any selection smaller than this size will not be drawn
let selectionSize = 30;

// first, get image coordinates so we can compare with the cursor positions
var sketchImg = document.getElementById("sketch-img");
var rect = sketchImg.getBoundingClientRect();
// console.log(rect);

var cursorStartX, cursorStartY, cursorEndX, cursorEndY;

// get the sketch image position every time the window changes
window.addEventListener("resize", () => {
  rect = sketchImg.getBoundingClientRect();
});

// set up canvas
let c = document.getElementsByClassName("blank-canvas")[0];

let ctx = c.getContext("2d");

// set the width and height so the image won't be too big
ctx.canvas.width = rect.right - rect.left;
ctx.canvas.height = rect.bottom - rect.top;

rect = sketchImg.getBoundingClientRect();
console.log(rect);

// Get cursor position, when drag starts
dragSelect.subscribe("dragstart", (e) => {
  // console.log(e);
  cursorStartX = dragSelect.getCurrentCursorPosition()["x"];
  cursorStartY = dragSelect.getCurrentCursorPosition()["y"];

  console.log(
    "cursorStartX: " + cursorStartX + ", cursorStartY: " + cursorStartY
  );
});

// Get cursor position, when drag ends
dragSelect.subscribe("callback", (e) => {
  // console.log(e);
  cursorEndX = dragSelect.getCurrentCursorPosition()["x"];
  cursorEndY = dragSelect.getCurrentCursorPosition()["y"];
  console.log("cursorEndX: " + cursorEndX + ", cursorEndY: " + cursorEndY);

  // If the starting point is different from the end point,
  // compute the selected portion of the img
  if (
    Math.abs(cursorStartX - cursorEndX) >= selectionSize ||
    Math.abs(cursorStartY - cursorEndY) >= selectionSize
  ) {
    var selectedFrame = computeSelected(
      cursorStartX,
      cursorStartY,
      cursorEndX,
      cursorEndY
    );
    drawSelectionBox(selectedFrame);

    var selectedFrameRelative = getSelectedRelative(selectedFrame);
    drawSelectedImg(selectedFrameRelative);

    saveImg(selectedFrameRelative);
  }
});

// define the function for computing the selected portion,
// return an object with coordinates of the selected area
let computeSelected = (cursorStartX, cursorStartY, cursorEndX, cursorEndY) => {
  var selectedFrame = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
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
};

// draw a frame around selected box
let drawSelectionBox = (selectedFrame) => {
  var div = document.createElement("div");
  div.setAttribute("class", "selection-box");
  div.style.position = "absolute";
  div.style.top = selectedFrame.top + "px";
  div.style.left = selectedFrame.left + "px";
  // Here's a limitation: since we're using window's size, it will only work on
  // screens that are not scrollable
  div.style.bottom = window.innerHeight - selectedFrame.bottom + "px";
  div.style.right = window.innerWidth - selectedFrame.right + "px";

  document.querySelector("body").appendChild(div);

  // clean up the variables
  selectedFrame = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
};

// THE NEXT SECTION IS FOR CANVAS

// first, when selecting a box, put that onto canvas with its position

// we need to get its relative position to the image container
let getSelectedRelative = (selectedFrame) => {
  var selectedFrameRelative = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };

  selectedFrameRelative.left = selectedFrame.left - rect.left;
  selectedFrameRelative.right = selectedFrame.right - rect.left;
  selectedFrameRelative.top = selectedFrame.top - rect.top;
  selectedFrameRelative.bottom = selectedFrame.bottom - rect.top;
  selectedFrameRelative.width =
    selectedFrameRelative.right - selectedFrameRelative.left;
  selectedFrameRelative.height =
    selectedFrameRelative.bottom - selectedFrameRelative.top;

  // console.log("selectedFrameRelative: ");
  // console.log(selectedFrameRelative.left);
  // console.log(selectedFrameRelative.top);
  // console.log(selectedFrameRelative.right);
  // console.log(selectedFrameRelative.bottom);
  // console.log(selectedFrameRelative.width);
  // console.log(selectedFrameRelative.height);

  return selectedFrameRelative;
};

// draw that onto the same relative spot of the canvas
let drawSelectedImg = (selectedFrameRelative) => {
  ctx.drawImage(
    sketchImg,
    selectedFrameRelative.left,
    selectedFrameRelative.top,
    selectedFrameRelative.width,
    selectedFrameRelative.height,
    selectedFrameRelative.left,
    selectedFrameRelative.top,
    selectedFrameRelative.width,
    selectedFrameRelative.height
  );
};

// for now, save it as an image object
// we'll use a new canvas and session storage

let saveImg = (selectedFrameRelative) => {
  var saveCanvas = document.createElement("canvas");
  saveCanvas.width = selectedFrameRelative.width;
  saveCanvas.height = selectedFrameRelative.height;
  var saveCtx = saveCanvas.getContext("2d");
  saveCtx.drawImage(
    c,
    selectedFrameRelative.left,
    selectedFrameRelative.top,
    selectedFrameRelative.width,
    selectedFrameRelative.height,
    0,
    0,
    selectedFrameRelative.width,
    selectedFrameRelative.height
  );
  // var saveImg = document.createElement('img');
  var saveImgSrc = saveCanvas.toDataURL("image/png");
  console.log(saveImgSrc);
  
  // var newTab = window.open();
  // newTab.document.body.innerHTML = '<img src="' + saveImgSrc + '"width="100px" height="100px">';

  // we'll use the url to send a post request to our server
  var serverUrl = 'http://0882-35-232-71-19.ngrok.io///predict';
  var xhr = new XMLHttpRequest;
  xhr.open("POST", serverUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  var message = JSON.stringify({
    url: saveImgSrc
  });
  

  xhr.send(message);

  xhr.onreadystatechange = () => {
    if (xhr.readyState == XMLHttpRequest.DONE) {
        alert(xhr.responseText);
    }
  };

};
