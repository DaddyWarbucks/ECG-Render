script.
        $(document).ready(function() {

            // Data is parsed into 12 sets/leads before being sent to the front-end.
            var a_plot_I = "#{plot_I}".split(',');
            var a_plot_II = "#{plot_II}".split(',');
            var a_plot_III = "#{plot_III}".split(',');
            var a_plot_v1 = "#{plot_v1}".split(',');
            var a_plot_v2 = "#{plot_v2}".split(',');
            var a_plot_v3 = "#{plot_v3}".split(',');
            var a_plot_v4 = "#{plot_v4}".split(',');
            var a_plot_v5 = "#{plot_v5}".split(',');
            var a_plot_v6 = "#{plot_v6}".split(',');
            var a_plot_aVR = "#{plot_aVR}".split(',');
            var a_plot_aVL = "#{plot_aVL}".split(',');
            var a_plot_aVF = "#{plot_aVF}".split(',');

            var width = window.innerWidth;
            var height = window.innerHeight;

            var canvas = $("#ecgcanvas").get(0);
            var ctx = canvas.getContext("2d");
            ctx.canvas.width  = width;
            ctx.canvas.height = height;

            var SAMPLE_SECONDS = 12;                   // 12 second sample
            var MAJ_BOX_SECONDS = 0.2;                 // Major box width is 0.2 seconds
            var MIN_BOX_SECONDS = MAJ_BOX_SECONDS / 5; // Minor box width is 0.04 seconds (one fifth of major)
            var MAJ_BOX_HEIGHT = 0.5;                  // Major box height is 0.5 mVolts

            var numberOfSamples = a_plot_I.length;        // Number of samples to plot, using plot 0 as reference
            var majBoxSizePixels = width / (SAMPLE_SECONDS / MAJ_BOX_SECONDS);
            var minBoxSizePixels = width / (SAMPLE_SECONDS / MIN_BOX_SECONDS);
            var moveXPerSample  = width / numberOfSamples;
            var pixelsPerMvolt = majBoxSizePixels / MAJ_BOX_HEIGHT;

            // Render the major grid
            renderMajor(majBoxSizePixels, "red");

            // Render the minor grid
            renderMinor(minBoxSizePixels, "pink");

            // Divide the panel 4x4 sub-panels
            var panelW = width / 4;
            var panelH = height / 4;

            renderSeparators(width, height);
            renderLabels(width, height);

            // row 1
            renderChannel(a_plot_I, 0, 0, panelH, panelW, 0);
            renderChannel(a_plot_aVR, panelW, 0, panelH, panelW, 1);
            renderChannel(a_plot_v1, panelW * 2, 0, panelH, panelW, 2);
            renderChannel(a_plot_v4, panelW * 3, 0, panelH, panelW, 3);

            // row 2
            renderChannel(a_plot_II, 0, panelH, panelH, panelW, 0);
            renderChannel(a_plot_aVL, panelW, panelH, panelH, panelW, 1);
            renderChannel(a_plot_v2, panelW * 2, panelH, panelH, panelW, 2);
            renderChannel(a_plot_v5, panelW * 3, panelH, panelH, panelW, 3);

            // row 3
            renderChannel(a_plot_III, 0, panelH * 2, panelH, panelW, 0);
            renderChannel(a_plot_aVF, panelW, panelH * 2, panelH, panelW, 1);
            renderChannel(a_plot_v3, panelW * 2, panelH * 2, panelH, panelW, 2);
            renderChannel(a_plot_v6, panelW * 3, panelH * 2, panelH, panelW, 3);

            // row 4 (covers all four columns)
            renderChannel(a_plot_II, 0, panelH * 3, panelH, width, 4);

            // Plot a channel
            //  channelData -> the array of mV values
            //  vsx         -> the x coordinate of the virtual panel
            //  vsy         -> the y coordinate of the virtual panel
            //  vx          -> the height of the virtual panel
            //  vw          -> the width of the virtual panel
            //  sector      -> section of ecg to plot:
            //                 "0"=seconds 1-3, "1"=4-6, "2"=7-9, "3"=10-12, "4"=all 12
            function renderChannel(channelData, vsx, vsy, vh, vw, sector) {

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#000';

                // Start and end index of the array to plot
                var i_start;
                var i_end;
                if (sector == 4) {
                    i_start = 0;
                    i_end = channelData.length;
                } else {
                    i_start = (channelData.length / 4) * sector;
                    i_end = (channelData.length / 4) * (sector + 1);
                }

                // Mid-point of y-axis on virtual canvas
                var ecgStart = (vh / 2) + vsy;

                // Starting x,y point on virtual canvas
                var x_value_prev = vsx;
                var y_value_prev = ((-1 * parseFloat(channelData[i_start])) * pixelsPerMvolt) + ecgStart;

                var x_value;
                var y_value;

                // Loop through the samples starting at i_start and ending at i_end.
                // i_start and i_end is the begin and end of the range
                for (var i = i_start; ((i < channelData.length) && (i < i_end)); i++) {
                    if ((i % 1) == 0) {
                        if (i > i_start) {
                            y_value_prev = y_value;
                            x_value_prev = x_value;
                        }
                        y_value = ((-1 * parseFloat(channelData[i])) * pixelsPerMvolt) + ecgStart;
                        x_value = ((i - i_start) * moveXPerSample) + vsx;
                        ctx.beginPath();
                        ctx.moveTo(x_value_prev, y_value_prev);
                        ctx.lineTo(x_value, y_value);
                        ctx.stroke();
                    }
                }

            }

            // Renders the big separators
            function renderSeparators(w, h) {
                var section_w = w / 4;
                var sep = h / 16;
                ctx.save();
                ctx.lineWidth = 2.5;
                for (var j = 1; j <= 3; j++) {
                    var x = h / 26;
                    for (var k = 1; k <= 6; k++) {
                        ctx.beginPath();
                        ctx.moveTo(section_w * j, x);
                        ctx.lineTo(section_w * j, x + sep);
                        ctx.closePath();
                        ctx.stroke();
                        x = x + (sep * 2);
                    }
                }
            }

            function renderLabels(w, h) {
                var section_h = (h / 4) + (h / 90);
                var section_w = (w / 4) - (w / 175);
                var text;
                var text_x;
                var text_y;
                for (var x = 0; x < 4; x++) {
                    for (var y = 0; y < 4; y++) {
                        switch (x) {
                            case 0:
                                    if (y==0) text = 'I';
                                    if (y==1) text = 'II';
                                    if (y==2) text = 'III';
                                    if (y==3) text = 'II';
                                    break;
                            case 1:
                                    if (y==0) text = 'aVR';
                                    if (y==1) text = 'aVL';
                                    if (y==2) text = 'aVF';
                                    if (y==3) text = '';
                                    break;
                            case 2:
                                    if (y==0) text = 'V1';
                                    if (y==1) text = 'V2';
                                    if (y==2) text = 'V3';
                                    if (y==3) text = '';
                                    break;
                            case 3:
                                    if (y==0) text = 'V4';
                                    if (y==1) text = 'V5';
                                    if (y==2) text = 'V6';
                                    if (y==3) text = '';
                                    break;
                        }

                        ctx.font = '25px Arial';
                        text_x = (section_w * x);
                        text_y = (section_h * y);
                        if (y == 0) { text_y += 25; }
                        if (x == 0) { text_x += 10; }
                        ctx.fillText(text, text_x, text_y);
                    }
                }
            }

            // Renders major grid
            function renderMajor(gridPixelSize, color) {
                ctx.save();
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = color;
                // horizontal grid lines
                for (var i = 0; i <= ctx.canvas.height; i = i + gridPixelSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(ctx.canvas.width, i);
                    ctx.closePath();
                    ctx.stroke();
                }
                // vertical grid lines
                for(var j = 0; j <= ctx.canvas.width; j = j + gridPixelSize) {
                    ctx.beginPath();
                    ctx.moveTo(j, 0);
                    ctx.lineTo(j, ctx.canvas.height);
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.restore();
            }

            // Renders minor Grid
            function renderMinor(gridPixelSize, color) {
                ctx.save();
                ctx.lineWidth = 0.3;
                ctx.strokeStyle = color;
                // horizontal grid lines
                for(var i = 0; i <= ctx.canvas.height; i = i + gridPixelSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(ctx.canvas.width, i);
                    ctx.closePath();
                    ctx.stroke();
                }
                // vertical grid lines
                for(var j = 0; j <= ctx.canvas.width; j = j + gridPixelSize) {
                    ctx.beginPath();
                    ctx.moveTo(j, 0);
                    ctx.lineTo(j, ctx.canvas.height);
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.restore();
            }

        });