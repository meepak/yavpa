import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import * as Clipboard from "expo-clipboard";
import { gifJs, gifWorkerJs } from './gif';


const GifjsWebview = ({ base64EncodedImages, onEncoded }) => {

    // TODO how to handle super long string??
    const encodedImagesJson = JSON.stringify(base64EncodedImages);
    const html = htmlContent(encodedImagesJson, gifJs, gifWorkerJs)


    Clipboard.setStringAsync(html || '');

    const handleWebViewMessage = (event) => {
        const message = JSON.parse(event.nativeEvent.data);

        if (message.type === 'error') {
            console.error('Error in webview:', message.data);
        }
        // This event will receive the base64 encoded GIF data
        const base64GifData = message.data;
        // console.log('got data from webview', base64GifData.length)
        // console.log(base64GifData);
        if (onEncoded) {
            onEncoded(base64GifData);
        }
    };

    return <WebView
        originWhitelist={['*']}
        source={{ html: html || '' }}
        onMessage={handleWebViewMessage}
        style={{ width: 0, height: 0 }}
        onLayout={(event) => { console.log('webview is loaded..') }}
        onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
        }}
    />;

}


// HTML content with embedded JavaScript for gif.js operation
const htmlContent = (encodedImagesJson: string, gifJs, gifWorkerJs) => `
<!DOCTYPE html>
<html>
<head>
    <title>GIF Creator</title>
    <script>
    ${gifJs}
    </script>
</head>
<body>
    <script>

      var workerScript = \`${gifWorkerJs}\`;
                var blob = new Blob([workerScript], { type: 'text/javascript' });
                var workerUrl = URL.createObjectURL(blob);

        function createGIF(images) {

            try {
                    var gif = new GIF({
                        workers: 4,
                        quality: 10,
                        workerScript: workerUrl
                    });

            var loadPromises = images.map(function(image) {
                return new Promise(function(resolve) {
                    var img = new Image();
                    img.src = 'data:image/png;base64,' + image;
                    img.onload = function() {
                        resolve(img);
                    };
                });
            });

            Promise.all(loadPromises).then(function(loadedImages) {
                loadedImages.forEach(function(img) {
                    gif.addFrame(img, {delay: 200});
                });

                gif.on('finished', function(blob) {
                    // Send the GIF data
                    var reader = new FileReader();
                    reader.onload = function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'gif', data: reader.result}));
                    };
                    reader.readAsDataURL(blob);
                });

                gif.render();
                });
        }catch (error) {
            // Send a debug message if there's an error
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', data: 'Error: ' + error.message }));
        }
    }

    // Immediately invoke createGIF with the passed images
    createGIF(${encodedImagesJson});
    </script>
</body>
</html>
    `.trim();



export default GifjsWebview;
