(function($){
    $.fn.audioVisualizor = function(src, options){
        var canvasObj = this[0];

        // Define default settings
        var settings = $.extend({
            width: canvasObj.width,
            height: canvasObj.height,
            gutter: 40,
            fftSize: 2048
        }, options);

        $(canvasObj).on("resize", function(){
            settings.width = canvasObj.width;
            settings.height = canvasObj.height;
        });

        // Get audio and canvas contexts
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var canvasCtx = canvasObj.getContext('2d');

        // Init and chain audio nodes
        var analyserNode = audioCtx.createAnalyser();
        var sourceNode = (function(){
            if(src instanceof HTMLAudioElement)
                return audioCtx.createMediaElementSource(src);
        })();
        sourceNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        analyserNode.fftSize = settings.fftSize;

        // Build audio data buffer
        var bufferLen = analyserNode.frequencyBinCount;
        var buffer = new Uint8Array(bufferLen);

        // Rounded rectangle prototype
        canvasCtx.fillRoundRect = function(x, y, width, height, radius){
            this.beginPath();
            this.moveTo(x+radius, y);
            this.lineTo(x+width-radius, y);
            this.quadraticCurveTo(x+width, y, x+width, y+radius);
            this.lineTo(x+width, y+height-radius);
            this.quadraticCurveTo(x+width, y+height, x+width-radius, y+height);
            this.lineTo(x+radius, y+height);
            this.quadraticCurveTo(x, y+height, x, y+height-radius);
            this.lineTo(x, y+radius);
            this.quadraticCurveTo(x, y, x+radius, y);
            this.fill();        
        }

        // Define draw method 
        setInterval(function(){
            analyserNode.getByteFrequencyData(buffer);

            canvasCtx.clearRect(0,0, settings.width, settings.height);

            var barWidth = (settings.width / bufferLen) * 3;
            var barHeight;
            var x = settings.gutter;

            for(var i = 0; i < bufferLen; i++) {
                barHeight = buffer[i]/3;

                canvasCtx.fillStyle='#fff';
                //canvasCtx.shadowBlur=50;
                canvasCtx.shadowColor="#246bad";

                if(barHeight > 0)
                    canvasCtx.fillRoundRect(x, settings.height-barHeight - 100, barWidth, barHeight, barWidth/2);

                x += barWidth + 2;

                if(x >= settings.width-settings.gutter)
                    break;
            }
        }, 50)

        return this;
    };
})(jQuery);
