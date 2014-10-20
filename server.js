// Process calls that get specific content
router.get('/content/:contentid', function(req, res, next) {

    // Configure the REST platform call
    var rest_options = {
        resource: '/content/' + req.params.contentid + '?render_format=plot',
        method: 'GET'
    };

    // The content from the Platform
    var content;

    // The parsed payload containing the json array of names and plots
    var payload;

    // Index location for the 12 leads by name
    var i_I, i_II, i_III, i_v1, i_v2, i_v3, i_v4, i_v5, i_v6, i_aVR, i_aVL, i_aVF;

    // Make the call to get the content
    //var platform = ihplatform(_config, req.session, rest_options, callback_content);
    //platform.execute();
    ihplatform(_config, req.session, rest_options, callback_content).execute();

    // Processing for call to get specific content
    function callback_content(error, response, body) {

        if (!error && response.statusCode == 200) {

            // Store the content
            content = JSON.parse(body);
            // Parse the plots. The `payload` attribute contains the plots
            // Two arrays:
            // - names contains the names of the leads
            // - plots contains the ecg values in mV
            payload = JSON.parse(content.payload);

            // Clear out the payload in the content once we've parsed it
            // into its own variable. No need to send it down to the client
            // as it will be represented in the 12 lead values
            content.payload = "";

            for (var x = 0; x < 12; x++) {
                switch(payload.names[x]) {
                    case 'LA-RA': i_I = x; break;
                    case 'RA-LL': i_II = x; break;
                    case 'III': i_III = x; break;
                    case 'V1': i_v1 = x; break;
                    case 'V2': i_v2 = x; break;
                    case 'V3': i_v3 = x; break;
                    case 'V4': i_v4 = x; break;
                    case 'V5': i_v5 = x; break;
                    case 'V6': i_v6 = x; break;
                    case 'aVR': i_aVR = x; break;
                    case 'aVL': i_aVL = x; break;
                    case 'aVF': i_aVF = x; break;
                }
            }

            // Get the content that's related to this content
            getRelatedContent();


        } else {
            res.render('500', {
                error: {
                    message: response.statusCode,
                    stack: body
                }
            });
        }

    }

    // Processing to get the related content
    // Called after getting the initial content is successful
    function getRelatedContent() {

        // Build the search parameters
        var search_for = {
            patient_id: content.patient_id
        };

        // Configure the API call
        rest_options = {
            resource: '/content',
            json: search_for,
            method: 'GET'
        };

        ihplatform(_config, req.session, rest_options, callback_related).execute();

    }

    // Processing for call to get related content
    function callback_related(error, response, body) {

        if (!error && response.statusCode == 200) {

            var related_content = body;
            if (typeof body === 'string') {
                related_content = JSON.parse(body);
            }

            if (content && related_content) {

                res.render('content', {
                    title: 'Content for content with id: ' + req.params.contentid,
                    content: content,
                    related_content: related_content,
                    plot_I: payload.plots[i_I],
                    plot_II: payload.plots[i_II],
                    plot_III: payload.plots[i_III],
                    plot_v1: payload.plots[i_v1],
                    plot_v2: payload.plots[i_v2],
                    plot_v3: payload.plots[i_v3],
                    plot_v4: payload.plots[i_v4],
                    plot_v5: payload.plots[i_v5],
                    plot_v6: payload.plots[i_v6],
                    plot_aVR: payload.plots[i_aVR],
                    plot_aVL: payload.plots[i_aVL],
                    plot_aVF: payload.plots[i_aVF]
                });

            } else {
                res.render('500', {
                    error: {
                        message: 'Unable to get related content.',
                        stack: ''
                    }
                })
            }


        } else {

            res.render('500', {
                error: {
                    message: response.statusCode,
                    stack: body
                }
            });

        }

    }

});