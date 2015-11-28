
//////////////////////////////// Configuration /////////////////////////////////

// Draws face tracking on video if true
var DRAW_FACE = true;

// Physical size decrease when looking down
var EYE_CONTRACTION = 100;

// Ratio to increase above constant by
var MAGIC_RATIO = 1.005;

///////////////////////////// Initialize Tracking //////////////////////////////

var vid = $('#webcam').get(0);
var drawLayer = $('#draw-layer').get(0);
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

var step_one = false;
var step_two = false;
var first_time = true;
var eye_nose_ratio;

$(document).keypress(function (e) {
  if (e.keyCode == 99) {
    // Calibrate
    // Do first step if completely uncalibrated
    //   or if completely calibrated and recalibrating (step_two = true)
    if (!step_one || step_two) {
      step_one = true;
      step_two = false;
      var curr_pos = ctracker.getCurrentPosition();
      eye_nose_ratio = getTotalRatio(curr_pos);
      $('#long-content').css('border', '2px solid blue');

    } else {
      step_two = true;

      // Do second step
      if (first_time) {
        requestAnimationFrame(trackEyes);
        first_time = false;
      }

      var curr_pos = ctracker.getCurrentPosition();
      var new_ratio = getTotalRatio(curr_pos);
      EYE_CONTRACTION = new_ratio / eye_nose_ratio;
      EYE_CONTRACTION *= MAGIC_RATIO;
      $('#long-content').css('border', '2px solid green');
    }
  }
});

/**
 * Tracks eyes and looks for a down or up look. Should only be run after the
 * system is calibrated.
 */
function trackEyes() {
  if (step_two) {
    requestAnimationFrame(trackEyes);

    // Compare ratios
    var curr_pos = ctracker.getCurrentPosition();
    if (curr_pos) {
      var new_ratio = getTotalRatio(curr_pos);
      if (new_ratio / eye_nose_ratio <= EYE_CONTRACTION) {
        $('#long-content').get(0).scrollTop += 5;
      }
    }
  }
}

/////////////////////////////// Helper Functions ///////////////////////////////

/**
 * Computes the ratio of eye size to eye-nose distance
 */
function getTotalRatio(positions) {
  return (positions[26][1] - positions[37][1]) / 
         (positions[24][1] - positions[37][1]);
}
