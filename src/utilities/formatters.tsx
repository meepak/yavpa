import { SvgDataType, getPointsFromPath } from "@/utilities/helper";

export const getStaticSvg = (svgData: SvgDataType) => {
  let text = `<svg viewBox="${svgData.metaData.viewBox}">`;
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
      '" fill="none" />';
  });
  text += "</svg>";

  //   Clipboard.setStringAsync(text);
  return text;
};

export const getSmilSvg = (svgData: SvgDataType) => {
  let text = `<svg viewBox="${svgData.metaData.viewBox}">`;
  svgData.pathData.forEach((path) => {
    text +=
      '<path d="' +
      path.path +
      '" stroke="' +
      path.stroke +
      '" stroke-width="' +
      path.strokeWidth +
      '" fill="none">';
    text +=
      '<animate attributeName="stroke-dashoffset" from="' +
      path.length +
      '" to="0" dur="2s" repeatCount="indefinite" />';
    text += "</path>";
  });
  text += "</svg>";

  //   Clipboard.setStringAsync(text);-
  return text;
};

export const getCssSvg = (svgData: SvgDataType) => {
  let text =
    `<svg viewBox="${svgData.metaData.viewBox}">` +
    '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
  text += '<style type="text/css"><![CDATA[';
  let totalDuration = 0;
  svgData.pathData.forEach((path, index) => {
    text += `
        #path${index} {
          stroke-dasharray: ${path.length};
          stroke-dashoffset: ${path.length};
          animation: dash 2s linear ${totalDuration}s forwards;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `;
    totalDuration += 2; // Add the duration of the current path's animation
  });
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
      '" fill="none" />';
  });
  text += "</svg>";

  return text;
};

export const getRnComponent = (svgData: SvgDataType) => {
  const guid = svgData.metaData.guid;
  const componentCode = `
    import React from 'react';
    import { View, StyleSheet } from 'react-native';
    import Svg, { Path } from 'react-native-svg';

    const SvgComponent${guid} = () => {
      return (
        <View style={StyleSheet.absoluteFill}>
          <Svg style={{ flex: 1 }} viewBox="${svgData.metaData.viewBox}">
            ${svgData.pathData
              .map((path, index) => {
                return `
                <Path
                  key={${index}}
                  d="${path.path}"
                  stroke="${path.stroke}"
                  strokeWidth={${path.strokeWidth}}
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
export const getLottieSvg = (svgData) => {
  let totalTime = 0;
  let layers = [];
  let beginTime = 0;

  svgData.pathData.forEach((path, index) => {
    totalTime += path.time;
    const points = getPointsFromPath(path.path);
    const v = points.map(
      (point: { x: number; y: number }) => `[${point.x}, ${point.y}]`
    );
    const startTime = beginTime;
    const endTime = path.time * 30;
    beginTime = endTime;

    let vValue = v.map((item: string) => JSON.parse(item));
    vValue = JSON.stringify(vValue);

    (layers as any).push(
      `{
      "ty": 4,
      "shapes": [
        {
          "ty": "sh",
          "ks": {
            "k": {
              "i": [[0, 0], [0, 0], [0, 0]],
              "o": [[0, 0], [0, 0], [0, 0]],
              "v": ${vValue},
              "c": false
            },
            "nm": "Path ${index + 1}",
            "s": { 
              "a": 0,
              "w": ${path.strokeWidth},
            },
          }
        },
        {
          "ty": "tm",
          "s": { "a": 0, "k": 0 },
          "e": { "a": 1, "k": [{ "s": 0, "e": 100, "t": ${startTime} }, { "s": 100, "e": 100, "t": ${endTime} }] }
        }
      ]
    }`
    );
  });

  //"g": ${path.stroke}

  const width = svgData.metaData.viewBox.split(" ")[2];
  const height = svgData.metaData.viewBox.split(" ")[3];
  const completeJsonString =
    `{
    "v": "5.7.1",
    "fr": 30,
    "ip": 0,
    "op": ${totalTime * 30},
    "w": ${width},
    "h": ${height},
    "layers": ` +
    layers.join(",") +
    `}`;

  return completeJsonString;
};
