import { PathDataType, SvgDataType, getPointsFromPath, getViewBoxTrimmed } from "@u/helper";
import { path } from "d3";

// TODO -- UPDATE WITH NEW STROKE PROPERTIES, strokeOpacity, strokeCap, strokeJoin

export const getStaticSvg = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  let text = `<svg viewBox="${viewBox}">`;
  svgData.pathData.forEach((path) => {
    text +=
      '<path d="' +
      path.path +
      '" pathLength="' +
      path.length +
      '" stroke="' +
      path.stroke +
      '" stroke-width="' +
      path.strokeWidth +
      '" stroke-linecap="' +
      path.strokeCap +
      '" stroke-linejoin="' +
      path.strokeJoin +
      '" stroke-opacity="' +
      path.strokeOpacity +
      '" fill="none" />';
  });
  text += "</svg>";

  //   Clipboard.setStringAsync(text);
  return text;
};


export const getSmilSvg = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  const speed = svgData.metaData.animation?.speed || 1;
  const loop = svgData.metaData.animation?.loop ? 'indefinite' : '1';
  const delay = svgData.metaData.animation?.delay || 0;
  const time = (t: number) => t / (1000*speed);
  let text = `<svg viewBox="${viewBox}">`;
  svgData.pathData.forEach((path) => {
    text +=
      '<path d="' +
      path.path +
      '" stroke="' +
      path.stroke +
      '" stroke-width="' +
      path.strokeWidth +
      '" stroke-linecap="' +
      path.strokeCap +
      '" stroke-linejoin="' +
      path.strokeJoin +
      '" stroke-opacity="' +
      path.strokeOpacity +
      '" fill="none">';
    text +=
      '<animate attributeName="stroke-dashoffset" from="' +
      path.length +
      '" to="0" dur="' + time(path.time) + 's" begin="' + delay + 's" repeatCount="' + loop + '" />';
    text +=
      '<set attributeName="opacity" to="1" begin="0s" dur="' + time(path.time) + 's" fill="freeze" />' +
      '<set attributeName="opacity" to="0" begin="' + time(path.time) + 's" dur="' + delay + 's" fill="freeze" />';
    text += "</path>";
  });
  text += "</svg>";

  console.log(svgData)
  return text;
};


export const getCssSvg = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  let text =
    `<svg viewBox="${viewBox}" id="animated-svg">` +
    '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
  text += '<style type="text/css"><![CDATA[';
  let totalDuration = 0;
  const speed = svgData.metaData.animation?.speed || 1;
  const loop = svgData.metaData.animation?.loop ? 'infinite' : '1';
  const delay = svgData.metaData.animation?.delay || 0;
  svgData.pathData.forEach((path, index) => {
    const time = path.time / (1000*speed);
    text += `
        #path${index} {
          stroke-dasharray: ${path.length};
          stroke-dashoffset: ${path.length};
          animation: dash ` + time + `s linear ${totalDuration}s forwards,
                     reset ` + delay + `s linear ` + (totalDuration + time) + `s forwards;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes reset {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: ${path.length};
          }
        }
      `;
    totalDuration += time + delay;
  });
  text += `
    #animated-svg {
      animation: fadeOut ` + delay + `s linear ` + totalDuration + `s forwards ` + loop + `;
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;
  text += "]]></style>";
  svgData.pathData.forEach((path, index) => {
    text +=
      '<path id="path' +
      index +
      '" d="' +
      path.path +
      '" stroke="' +
      path.stroke +
      '" stroke-width="' +
      path.strokeWidth +
      '" stroke-linecap="' +
      path.strokeCap +
      '" stroke-linejoin="' +
      path.strokeJoin +
      '" stroke-opacity="' +
      path.strokeOpacity +
      '" fill="none" />';
  });
  text += "</svg>";

  return text;
};


export const getLottieSvg = (svgData: { pathData: PathDataType[]; metaData: any; }) => {
  let totalTime = 0;
  let layers = [];
  let beginTime = 0;
  const speed = svgData.metaData.animation?.speed || 1;
  const delay = svgData.metaData.animation?.delay || 0;

  // get width and height from viewbox
  // const viewBox = getViewBoxTrimmed(svgData.pathData).split(' ');
  const viewBox = svgData.metaData.viewBox.split(' ');
  // console.log(viewBox);
  const width = Math.round(parseFloat(viewBox[2]));
  const height = Math.round(parseFloat(viewBox[3]));

  svgData.pathData.forEach((path, index) => {
    const time = (path.time / 1000) / speed; // Convert time to seconds and apply speed
    console.log(time);
    totalTime += time;
    const points = getPointsFromPath(path.path); // Ensure this returns [{x, y}, ...]
    const v = points.map(point => [point.x, point.y]);
    
    // console.log(v)

    const startTime = beginTime + delay; // Delay is already in seconds
    const endTime = startTime + time; // Time is in seconds
    beginTime = endTime;

    // Convert hex color to RGB array
    const strokeRgb = hexToRgb(path.stroke); // Ensure this returns [r, g, b]

    layers.push({
      "ty": 4, // Type 4 for shape layers
      "ind": index,
      "ks": {
        "o": { "a": 0, "k": 100 }, // Layer opacity (100%)
        "r": { "a": 0, "k": 0 }, // Rotation (0 degrees)
        "p": { "a": 0, "k": [0, 0, 0] }, // Position ([x, y, z])
        "a": { "a": 0, "k": [0, 0, 0] }, // Anchor point
        "s": { "a": 0, "k": [100, 100, 100] }, // Scale ([x%, y%, z%])
      },
      "shapes": [
        {
          "ty": "gr", // Group type
          "it": [
            {
              "ty": "sh", // Shape type
              "d": 1, // Direction (1 for normal)
              "ks": {
                "a": 0,
                "k": {
                  "i": [], // In tangents (empty for basic paths)
                  "o": [], // Out tangents (empty for basic paths)
                  "v": v, // Vertices
                  "c": true // Closed path
                }
              },
            },
            {
              "ty": "st", // Stroke type
              "c": { "a": 0, "k": strokeRgb }, // Stroke color
              "o": { "a": 0, "k": (path.strokeOpacity || 1) * 100 }, // Stroke opacity
              "w": { "a": 0, "k": path.strokeWidth }, // Stroke width
              "lc": 1, // Line cap (1 = butt cap)
              "lj": 1, // Line join (1 = miter join)
            },
            {
              "ty": "tm", // Trim path type
              "s": { "a": 1, "k": [{ "t": 0, "s": [0], "e": [0] }, { "t": time * 30, "s": [0], "e": [100] }] }, // Start
              "e": { "a": 1, "k": [{ "t": 0, "s": [0], "e": [0] }, { "t": time * 30, "s": [0], "e": [100] }] }, // End
              "o": { "a": 0, "k": 0 }, // Offset
              "m": 1, // Trim Multiple Shapes (1 = simultaneously)
              "ix": 1, // Property Index
            }
          ]
        }
      ],
      "ip": 0,
      "op": Math.round(totalTime * 30), // Use the total animation time to define the out point, converted to frames
      "st": 0, // Start time of the layer
      "bm": 0, // Blend mode (0 = normal)
    } as never);
  });

  const lottieJson = {
    "v": "5.7.4", // Lottie version
    "fr": 30, // Frame rate
    "ip": 0, // In point
    "op": Math.round(totalTime * 30), // Out point (total time in frames), converted to frames
    "w": width, // Width (example, adjust as needed)
    "h": height, // Height (example, adjust as needed)
    "ddd": 0, // 3D layer (0 = off)
    "assets": [], // No external assets
    "layers": layers
  };

  return lottieJson;
};


function hexToRgb(hex) {
  // Ensure this function correctly converts hex to RGB
  let r = 0, g = 0, b = 0;
  // 3 digits
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return [r, g, b];
}





// let's not include RN component for now
export const getRnComponent = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  const guid = svgData.metaData.guid;
  const componentCode = `
    import React from 'react';
    import { View, StyleSheet } from 'react-native';
    import Svg, { Path } from 'react-native-svg';

    const SvgComponent${guid} = () => {
      return (
        <View style={StyleSheet.absoluteFill}>
          <Svg style={{ flex: 1 }} viewBox="${viewBox}">
            ${svgData.pathData
      .map((path, index) => {
        return `
                <Path
                  key={${index}}
                  d="${path.path}"
                  stroke="${path.stroke}"
                  strokeWidth={${path.strokeWidth}}
                  strokeLinecap="${path.strokeCap}"
                  strokeLinejoin="${path.strokeJoin}"
                  opacity={${path.strokeOpacity}}
                  fill="none"
                  strokeDasharray={${path.length}}
                  strokeDashoffset={${path.length}}
                />
              `;
      })
      .join("")}
          </Svg>
        </View>
      );
    };

    export default SvgComponent${guid};
  `;

  // Save the component code to a file, send it to a server, etc.
  return componentCode;
};
