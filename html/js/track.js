
//////////////////////////////// Configuration /////////////////////////////////

// Draws face tracking on video if true
var DRAW_FACE = true;

// Physical size decrease when looking down
var EYE_CONTRACTION = 100;

// Recalibration timeout in seconds
var RECAL_TIMEOUT = 10;

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
var recalibrate_timeout;
var eye_nose_ratio;

/**
 * Calibrates the tracker
 */
function startTrackingEyes() {
  if (calibrated) {
    requestAnimationFrame(trackEyes);

  } else {

    // record initial positions
    var curr_pos = ctracker.getCurrentPosition();
    if (curr_pos) {
      setTimeout(reg_cal, 1000);
      console.log('wait 1 sec');
      // eye_nose_ratio = getTotalRatio(curr_pos);
      // console.log('first', eye_nose_ratio);
    } else {
      requestAnimationFrame(startTrackingEyes);
    }
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
    if (curr_pos) {
      var new_ratio = getTotalRatio(curr_pos);
      if (new_ratio / eye_nose_ratio < EYE_CONTRACTION) {
        console.log('Looking down!');
        document.getElementById('long-content').scrollTop += 2;
      }
    }

  } else {
    // Need to calibrate
    console.log('Recalibrate');
    requestAnimationFrame(startTrackingEyes);
  }
}

function reg_cal() {
  var curr_pos = ctracker.getCurrentPosition();
  eye_nose_ratio = getTotalRatio(curr_pos);
  console.log('first', eye_nose_ratio);
}

function calibrate() {
  requestAnimationFrame(trackEyes);
  calibrated = true;
  var curr_pos = ctracker.getCurrentPosition();
  var new_ratio = getTotalRatio(curr_pos);
  console.log(new_ratio);
  EYE_CONTRACTION = new_ratio / eye_nose_ratio;
}

// recalibrate_timeout = window.setTimeout(recalibrate, RECAL_TIMEOUT * 1000);
// function recalibrate() {
//   window.clearTimeout(recalibrate_timeout);

//   calibrated = false;
//   // Recalibrate every RECAL_TIMEOUT seconds
//   recalibrate_timeout = window.setTimeout(recalibrate, RECAL_TIMEOUT * 1000);
// }

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Computes the ratio of eye size to eye-nose distance
 */
function getTotalRatio(positions) {
  return (positions[26][1] - positions[37][1]) / 
         (positions[24][1] - positions[37][1]);
}
