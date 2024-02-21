import { getPointsFromPath, getViewBoxTrimmed } from "@u/helper";
import { SvgDataType, PathDataType, MetaDataType, BrushType } from "@u/types";
import { Brushes, getBrushSvg } from './brushes';

export const getStaticSvg = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  let text = `<svg viewBox="${viewBox}">`;

  svgData.pathData.forEach((path) => {
    // Check if the stroke value is a brush guid
    let brush: BrushType | undefined;
    if (path.stroke.startsWith("url(#")) {
      const brushGuid = path.stroke.slice(5, -1);
      brush = Brushes.find(brush => brush.params.guid === brushGuid);
    }
    if (brush) {
      text += getBrushSvg(brush);
    }

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

  return text;
};


export const getSmilSvg = (svgData: SvgDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
  const speed = svgData.metaData.animation?.speed || 1;
  const loop = svgData.metaData.animation?.loop ? 'indefinite' : '1';
  const delay = svgData.metaData.animation?.delay || 0;
  const time = (t: number) => t / (1000 * speed);
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

  // console.log(svgData)
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
    const time = path.time / (1000 * speed);
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


export const getLottieTrimmedPath = (svgData: SvgDataType) => {
  let totalTime = 0;
  let layers = [] as any[];
  let beginTime = 0;
  const speed = svgData.metaData.animation?.speed || 1;
  const delay = svgData.metaData.animation?.delay || 0;

  // Extract width and height from viewBox
  const viewBox = svgData.metaData.viewBox.split(' ');
  const width = Math.round(parseFloat(viewBox[2]));
  const height = Math.round(parseFloat(viewBox[3]));

  svgData.pathData.forEach((path, index) => {
    const time = (path.time / 1000) / speed; // Convert time to seconds and apply speed
    totalTime += time;
    const points = getPointsFromPath(path.path);

    const startTime = beginTime + delay;
    const endTime = startTime + time;
    beginTime = endTime;

    // Convert stroke color to RGB array
    const strokeRgb = hexToRgb(path.stroke);
    const isPathClosed = points[0] === points[points.length - 1];

    layers.push({
      "ddd": 0,
      "ty": 4,
      "ind": 0,
      "st": 0,
      "ip": 0, // have to update if there is more than one path
      "op": Math.round(time * 60),
      "nm": "Layer" + index,
      "mn": path.guid,
      "ao": 0,
      "ks": {
        "a": { "a": 0, "k": [0, 0] },
        "p": { "a": 0, "k": [0, 0] },
        "s": { "a": 0, "k": [100, 100] },
        "r": { "a": 0, "k": 0 },
        "o": { "a": 0, "k": 100 }
      },
      "shapes": [
        {
          "ty": "gr",
          "nm": "Shape" + index,
          "mn": path.guid + index,
          "it": [
            {
              "ty": "sh",
              "nm": "Path" + index,
              "mn": path.guid + index + 1,
              "d": 1,
              "ks": {
                "a": 0,
                "k": {
                  "c": isPathClosed ? "true" : "false",
                  "v": [points.map(point => [point.x, point.y])],
                  "i": [points.map(point => [0, 0])],
                  "o": [points.map(point => [0, 0])],
                }
              }
            },
            {
              "ty": "st",
              "nm": path.guid + index + 2,
              "o": {
                "a": 0,
                "k": 100
              },
              "lc": 2,
              "lj": 2,
              "ml": 0,
              "w": {
                "a": 1,
                "k": [
                  {
                    "t": 0,
                    "s": [18],
                    "h": 0,
                    "o": { "x": [0], "y": [0] },
                    "i": { "x": [1], "y": [1] }
                  },
                  {
                    "t": 38,
                    "s": [5],
                    "h": 0,
                    "o": { "x": [0], "y": [0] },
                    "i": { "x": [1], "y": [1] }
                  },
                  { "t": 170, "s": [25] }
                ]
              },
              "c": {
                "a": 0,
                "k": strokeRgb
              }
            },

            {
              "ty": "tm",
              "nm": "Trim Path" + index,
              "mn": path.guid + index + 3,
              "s": {
                "a": 1,
                "k": [
                  {
                    "t": 0,
                    "s": [0],
                    "h": 0,
                    "o": { "x": [0], "y": [0] },
                    "i": { "x": [1], "y": [1] }
                  },
                  {
                    "t": 39,
                    "s": [0],
                    "h": 0,
                    "o": { "x": [0], "y": [0] },
                    "i": { "x": [1], "y": [1] }
                  },
                  { "t": 179, "s": [100] }
                ]
              },
              "e": { "a": 0, "k": 100 },
              "o": { "a": 0, "k": 0 },
              "m": 1
            },
            {
              "ty": "tr",
              "a": { "a": 0, "k": [width, height] },
              "p": { "a": 0, "k": [256, 256] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ]
    });
  });



  const lottieJson = {
    "v": "5.7.1",
    "ip": 0,
    "op": Math.round(totalTime * 60),
    "nm": "Composition",
    "mn": svgData.metaData.guid,
    "fr": 60,
    "w": width,
    "h": height,
    "assets": [],
    "layers": layers
  };
  // Add missing function hexToRgb
  function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return [r / 255, g / 255, b / 255];
  }



  return lottieJson;

};




// let's not include RN component for now
// export const getRnComponent = (svgData: SvgDataType, trimViewBox = true) => {
//   const viewBox = trimViewBox ? getViewBoxTrimmed(svgData.pathData) : svgData.metaData.viewBox;
//   const guid = svgData.metaData.guid;
//   const componentCode = `
//   import React from 'react';
//   import { View, StyleSheet } from 'react-native';
//   import Svg, { Path } from 'react-native-svg';

//   const SvgComponent${guid} = () => {
//     return (
//       <View style={StyleSheet.absoluteFill}>
//         <Svg style={{ flex: 1 }} viewBox="${viewBox}">
//           ${svgData.pathData
//       .map((path, index) => {
//         return `
//               <Path
//                 key={${index}}
//                 d="${path.path}"
//                 stroke="${path.stroke}"
//                 strokeWidth={${path.strokeWidth}}
//                 strokeLinecap="${path.strokeCap}"
//                 strokeLinejoin="${path.strokeJoin}"
//                 opacity={${path.strokeOpacity}}
//                 fill="none"
//                 strokeDasharray={${path.length}}
//                 strokeDashoffset={${path.length}}
//               />
//             `;
//       })
//       .join("")}
//         </Svg>
//       </View>
//     );
//   };

//   export default SvgComponent${guid};

//   // Save the component code to a file, send it to a server, etc.
//   return componentCode;
// };
