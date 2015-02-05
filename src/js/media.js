/*

Copyright 2014 Pierre Walch
pwalch.net

  This file is part of RemoteMp4Player.

    RemoteMp4Player is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    RemoteMp4Player is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with RemoteMp4Player.  If not, see <http://www.gnu.org/licenses/>.
*/

var MediaPlayer = MediaPlayer || {};

MediaPlayer.kWidth = 640;
MediaPlayer.kHeight = 480;

MediaPlayer.kMenuSpace = "menu-space";
MediaPlayer.kMenuList = "menu-list";
MediaPlayer.kMenuItem = "menu-item-";

MediaPlayer.kVideoSpace = "video-space";
MediaPlayer.kVideoPlayer = "video-player";
MediaPlayer.kVideoSource = "video-source";

MediaPlayer.kPreviousButton = "previous-button";
MediaPlayer.kNextButton = "next-button";
MediaPlayer.kShuffleButton = "shuffle-button";

MediaPlayer.kNoVideoErrorRow = "no-video-error-row";
MediaPlayer.kActualPlayerRow = "actual-player-row";

MediaPlayer.gFilenameList = {};
MediaPlayer.gCurrentIndex = 0;

$(document).ready(function() {
    console.log("Starting application.");
    MediaPlayer.run();
});

// TJ Crowder on StackOverflow
// http://stackoverflow.com/a/15313435
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

MediaPlayer.run = function() {
    $.getJSON("listMp4.php", function(parsed_json) {
        var filenameList = parsed_json;
        if (filenameList.length > 0) {
            console.log("Found videos to play, starting player.");
            MediaPlayer.showPlayer(true);
            MediaPlayer.create(filenameList);
        } else {
            console.log("No video found, displaying error.");
            MediaPlayer.showPlayer(false);
        }
    });
};

MediaPlayer.showPlayer = function(isShowed) {
    if (isShowed) {
        $("#" + MediaPlayer.kNoVideoErrorRow).hide();
        $("#" + MediaPlayer.kActualPlayerRow).show();
    } else {
        $("#" + MediaPlayer.kNoVideoErrorRow).show();
        $("#" + MediaPlayer.kActualPlayerRow).hide();
    }
};

MediaPlayer.create = function(filenameList) {
    console.log("Creating main components.");

    MediaPlayer.registerMainIndependentInputs();
    MediaPlayer.createVideoTag();

    MediaPlayer.initialize(filenameList);
};

MediaPlayer.initialize = function(filenameList) {
    MediaPlayer.initializeVideoMenu(filenameList);
    MediaPlayer.setVideo(0);
};

MediaPlayer.registerMainIndependentInputs = function() {
    console.log("Registering main independent inputs.");

    $("#" + MediaPlayer.kPreviousButton).click(function() {
        MediaPlayer.pressPreviousButton();
    });

    $("#" + MediaPlayer.kNextButton).click(function() {
        MediaPlayer.pressNextButton();
    });

    $("#" + MediaPlayer.kShuffleButton).click(function() {
        MediaPlayer.pressShuffleButton();
    });

    Mousetrap.bind("left", function() {
        MediaPlayer.pressPreviousButton();
    });

    Mousetrap.bind("right", function() {
        MediaPlayer.pressNextButton();
    });

    Mousetrap.bind("space", function() {
        MediaPlayer.pressPlayPauseButton();
    });

    Mousetrap.bind("s", function() {
        MediaPlayer.pressShuffleButton();
    });
};

MediaPlayer.pressPreviousButton = function() {
    console.log("Moving to previous video.");
    MediaPlayer.setVideo(MediaPlayer.gCurrentIndex - 1);
};

MediaPlayer.pressNextButton = function() {
    console.log("Moving to next video.");
    MediaPlayer.setVideo(MediaPlayer.gCurrentIndex + 1);
};

MediaPlayer.pressPlayPauseButton = function() {
    var videoPlayer = $("#" + MediaPlayer.kVideoPlayer).get(0);
    if (videoPlayer.paused) {
        console.log("Playing video.");
        videoPlayer.play();
    } else {
        console.log("Pausing video.");
        videoPlayer.pause();
    }
};

MediaPlayer.pressShuffleButton = function() {
    console.log("Shuffling video menu.");

    var videoPlayer = $("#" + MediaPlayer.kVideoPlayer).get(0);
    videoPlayer.pause();

    MediaPlayer.initialize(MediaPlayer.findShuffledVideoList());
};

MediaPlayer.findShuffledVideoList = function() {
    return MediaPlayer.shuffleArray(MediaPlayer.gFilenameList);
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
MediaPlayer.shuffleArray = function(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

MediaPlayer.initializeVideoMenu = function(filenameList) {
    console.log("Initializing video menu with new filename list");

    MediaPlayer.gFilenameList = filenameList;
    $("#" + MediaPlayer.kMenuSpace).css("height", MediaPlayer.kHeight + "px");

    $("#" + MediaPlayer.kMenuList).empty();
    for (var i = 0; i < filenameList.length; ++i) {
        var videoItemTag = $(
            "<li id=\"" + MediaPlayer.kMenuItem + i + "\">" +
            "<a href=\"#\">" + filenameList[i]  + "</a></li>"
        );
        videoItemTag.click(function() {
            var elementId = $(this).attr('id');
            // TODO change menu item to the constant in regex
            var videoIndex = parseInt(/menu-item-(\d+)/g.exec(elementId)[1]);
            MediaPlayer.setVideo(videoIndex);
        });
        $("#" + MediaPlayer.kMenuList).append(videoItemTag);
    }
};

MediaPlayer.createVideoTag = function() {
    console.log("Creating empty video tag.");

    var videoPlayerTag = $(
        "<video id=\"" + MediaPlayer.kVideoPlayer + "\"" +
         "class=\"video-player\"" +
         "width=\"" + MediaPlayer.kWidth + "\" " +
         "height=\"" + MediaPlayer.kHeight + "\" " +
         "controls autoplay>" +
         "<span>Your browser does not support the video tag.</span>" +
         "</video>"
     );
    $("#video-space").append(videoPlayerTag);
};

MediaPlayer.setVideo = function(index) {
    console.log("Setting video " + index + " : " + MediaPlayer.gFilenameList[index]);

    MediaPlayer.gCurrentIndex = index;
    $("#" + MediaPlayer.kMenuList + ">li.active").removeClass("active");
    $("#" + MediaPlayer.kMenuItem + index).addClass("active");
    
    if (MediaPlayer.gCurrentIndex > 0) {
        $("#" + MediaPlayer.kPreviousButton).removeClass("disabled");
    } else {
        $("#" + MediaPlayer.kPreviousButton).addClass("disabled");
    }

    if (MediaPlayer.gCurrentIndex < MediaPlayer.gFilenameList.length - 1) {
        $("#" + MediaPlayer.kNextButton).removeClass("disabled");
    } else {
        $("#" + MediaPlayer.kNextButton).addClass("disabled");
    }

    MediaPlayer.loadVideo(index);
};

MediaPlayer.loadVideo = function(index) {
    var videoFilename = MediaPlayer.gFilenameList[index];
    var videoPlayerTag = $("#" + MediaPlayer.kVideoPlayer).get(0);
    if ($(videoPlayerTag).has("#" + MediaPlayer.kVideoSource).length > 0) {
        console.log("Setting source tag source with video " + index);
        $("#" + MediaPlayer.kVideoSource).attr("src", videoFilename);
    } else {
        console.log("Creating source tag with video " + index);
        var videoSourceTag = $(
            "<source id=\"" + MediaPlayer.kVideoSource + "\" " +
            "src=\"" + videoFilename + "\" " +
            "type=\"video/mp4\"></source>"
        );
        $(videoPlayerTag).append(videoSourceTag);
    }

    videoPlayerTag.load();
    videoPlayerTag.play();
};
