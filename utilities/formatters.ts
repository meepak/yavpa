import { getViewBoxTrimmed } from "@u/helper";
import { MyPathDataType, BrushType, CANVAS_VIEWBOX_DEFAULT } from "@u/types";
import { Brushes, getBrushSvg } from '../component/my-brushes';

export const getStaticSvg = (myPathData: MyPathDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(myPathData.pathData) : CANVAS_VIEWBOX_DEFAULT;
  let text = `<svg viewBox="${viewBox}">`;

  myPathData.pathData.forEach((path) => {
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


export const getSmilSvg = (myPathData: MyPathDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(myPathData.pathData) : CANVAS_VIEWBOX_DEFAULT;
  const speed = myPathData.metaData.animation?.speed || 1;
  const loop = myPathData.metaData.animation?.loop ? 'indefinite' : '1';
  const delay = myPathData.metaData.animation?.delay || 0;
  const time = (t: number) => t / (1000 * speed);
  let text = `<svg viewBox="${viewBox}">`;
  myPathData.pathData.forEach((path) => {
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

  // Add the image as a background before closing the svg tag
  if (myPathData.imageData && myPathData.imageData.length > 0) {
    const base64Data = myPathData.imageData[0].data;
    text += `<image href="${base64Data}" x="0" y="0" height="100%" width="100%" />`;
  }

  // myConsole.log(myPathData)
  return text;
};


export const getCssSvg = (myPathData: MyPathDataType, trimViewBox = true) => {
  const viewBox = trimViewBox ? getViewBoxTrimmed(myPathData.pathData) : CANVAS_VIEWBOX_DEFAULT;
  let text =
    `<svg viewBox="${viewBox}" id="animated-svg">` +
    '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
  text += '<style type="text/css"><![CDATA[';
  let totalDuration = 0;
  const speed = myPathData.metaData.animation?.speed || 1;
  const loop = myPathData.metaData.animation?.loop ? 'infinite' : '1';
  const delay = myPathData.metaData.animation?.delay || 0;
  myPathData.pathData.forEach((path, index) => {
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
  myPathData.pathData.forEach((path, index) => {
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