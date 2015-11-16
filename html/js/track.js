
//////////////////////////////// Configuration /////////////////////////////////

// Draws face tracking on video if true
var DRAW_FACE = true;

// Physical size decrease when looking down
var EYE_CONTRACTION = 0.7;

///////////////////////////// Initialize Tracking //////////////////////////////

var vid = document.getElementById('webcam');
var drawLayer = document.getElementById('draw-layer');
var drawLayerCC = drawLayer.getContext('2d');

var ctracker = new clm.tracker({ useWebGL : true });
ctracker.init(pModel);

// Setup video stream
navigator.webkitGetUserMedia({ video: true }, function (stream) {
  vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
  vid.play();
}, function (e) {
  alert('Error fetching video from camera.\n' + e);
});

vid.addEventListener('canplay', startVideo, false);

/**
 * Initializes tracking on the video
 */
function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctracker.start(vid);
  // start loop to draw face
  drawLoop();
  // start loop to keep track of eyes
  startTrackingEyes();
}

/**
 * Draws the face on the video element
 */
function drawLoop() {
  requestAnimationFrame(drawLoop);
  if (DRAW_FACE) {
    drawLayerCC.clearRect(0, 0, 400, 300);
    if (ctracker.getCurrentPosition()) {
      ctracker.draw(drawLayer);
    }
  }
}

///////////////////////////////// Eye Tracking /////////////////////////////////

var calibrated = false;
var eye_nose_ratio;

/**
 * Calibrates the tracker
 */
function startTrackingEyes() {
  if (calibrated) {
    requestAnimationFrame(trackEyes);

  } else {
    requestAnimationFrame(startTrackingEyes);
    calibrated = true;

    // record initial positions
    var curr_pos = ctracker.getCurrentPosition();
    eye_nose_ratio = getTotalRatio(curr_pos);
  }
}

/**
 * Tracks eyes and looks for a down or up look. Should only be run after the
 * system is calibrated.
 */
function trackEyes() {
  if (calibrated) {
    requestAnimationFrame(trackEyes);

    // Compare ratios
    var curr_pos = ctracker.getCurrentPosition();
    var new_ratio = getTotalRatio(curr_pos);
    if (new_ratio / eye_nose_ratio <= EYE_CONTRACTION) {
      console.log('Looking down!');
    }

  } else {
    // Need to calibrate
    requestAnimationFrame(startTrackingEyes);
  }
}

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Computes the ratio of eye size to eye-nose distance
 */
function getTotalRatio(positions) {
  return (positions[24][1] - positions[26][1]) / 
         (positions[26][1] - positions[37][1]);
}
