// import Svg from "react-native-svg";
// import React from "react";
// import MyPath from "./my-path";
// import { CANVAS_VIEWBOX, PathDataType, MyPathDataType } from "@u/types";
// import SvgAnimate from "./screens/file/preview/animate";
// import ViewShot, { captureRef } from "react-native-view-shot";
// import myConsole from "./my-console-log";

// const MyGifExporter =
//   ({ data, }: { data: MyPathDataType }) => {
//     const viewShotRef = React.useRef<ViewShot>(null);
//     const mypath = React.useRef<SvgAnimate>(null);

//     const screenshotInterval = setInterval(() => {
//       if (viewShotRef.current) {
//         captureRef(viewShotRef.current, {
//           format: "jpg",
//           quality: 0.8,
//         })
//           .then(
//             uri => myConsole.log("Image saved to", uri),
//             error => console.error("Oops, snapshot failed", error)
//           );
//       }
//     }, 100);

//     return (
//     <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
//       < SvgAnimate ref={mypath} myPathData={data} viewBox={CANVAS_VIEWBOX} />
//     </ViewShot>
//   )}

// export default MyGifExporter;