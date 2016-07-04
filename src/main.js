'use strict';
(function(window){
    window.VideoTransparencyConfig = window.VideoTransparencyConfig || {
        counter: 0,
        elementId: 'uniqueness'
    }
    function VideoTransparency(element, rgb_array, tolerance, fps) {
        var id = window.VideoTransparencyConfig.elementId + window.VideoTransparencyConfig.counter;
        var video = document.querySelector(element),
            canvas = document.createElement('canvas');
                canvas.setAttribute('id', id),
                canvas.setAttribute('data-video-id', video.id),
        document.body.appendChild(canvas);

        var ctx1 = canvas.getContext("2d");
        var eventHandler = function() {
            var parent_xy = getXYpos(video);
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.style.position = 'absolute',
            canvas.style.left = parent_xy.x + 'px',
            canvas.style.top = parent_xy.y + 'px';
            videoCallback(video);
            video.style.visibility = 'hidden';
            video.removeEventListener("play", eventHandler, false);
        };
        video.addEventListener("play", eventHandler, false);

        /* method 1 requirement */
        // var r = [rgb_array[0]-tolerance, rgb_array[0]+tolerance],
        //     g = [rgb_array[1]-tolerance, rgb_array[1]+tolerance],
        //     b = [rgb_array[2]-tolerance, rgb_array[2]+tolerance];

        window.VideoTransparencyConfig.counter++;

        function videoCallback() {
            if (video.paused || video.ended) {
              return;
            }
            computeFrame();
            requestAnimFrame(function(){
                videoCallback();
            }, fps || (1000/60));
        }
        function computeFrame() {
            ctx1.drawImage(video, 0, 0, video.videoWidth, video.videoHeight );
            var frame = ctx1.getImageData(0, 0, video.videoWidth, video.videoHeight);
            var l = frame.data.length;

            /* method 1 */
            // for (var i = 0; i < l; i+=4) {
            //     var frame_r = frame.data[i + 0],
            //         frame_g = frame.data[i + 1],
            //         frame_b = frame.data[i + 2];

            //     if (frame_r > r[0] &&  frame_r < r[1]
            //         && frame_g > g[0] &&  frame_g < g[1]
            //         && frame_b > b[0] &&  frame_b < b[1])
            //         { frame.data[i + 3] = 0; }
            // }

            /* method 2 */
            for (var i = 0; i < l; i+=4) {
                var diff = Math.abs(frame.data[i] - frame.data[0])
                    + Math.abs(frame.data[i+1] - frame.data[1])
                    + Math.abs(frame.data[i+2] - frame.data[2]);

                frame.data[i + 3] = (diff * diff) / tolerance;
            }

            ctx1.putImageData(frame, 0, 0);
        }
        function getXYpos(elem) {
            if (!elem) {return {x:0, y:0};}

            var xy = {x:elem.offsetLeft, y:elem.offsetTop},
                par=getXYpos(elem.offsetParent);

            for (var key in par) {
                xy[key] += par[key];
            }

            return xy;
        }
        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }
    window.VideoTransparency = VideoTransparency;
})(window);
