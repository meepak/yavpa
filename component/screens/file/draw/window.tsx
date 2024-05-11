import React, { useContext, useEffect, useState } from "react";
import { Image } from "react-native";
// import { Image } from "expo-image";
// import Svg, { Rect, G, Circle, Image } from "react-native-svg";
import MyPath from "@c/controls/pure/my-path";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MY_BLACK, SCREEN_HEIGHT } from "@u/types";
import { useMyPathDataContext } from "@x/svg-data";
import { getViewBoxTrimmed } from "@u/helper";
import { getScreenshot } from "@u/storage";
import { useUserPreferences } from "@x/user-preferences";

const PreviewWindow = ({ maxHeight, maxWidth }) => {
  const { myPathData, setMyPathData } = useMyPathDataContext();
  const [viewBox, setViewBox] = useState("0 0 0 0");
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const [imageBase64, setImageBase64] = useState<string>();
  const { defaultStorageDirectory } = useUserPreferences();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    getScreenshot(defaultStorageDirectory, myPathData.metaData.guid, "full")
      .then((image) => {
        image && setImageBase64(image);
      })
      .catch((error) => console.log(error));
  }, [
    myPathData.pathData,
    myPathData.metaData.canvasScale,
    myPathData.metaData.canvasTranslateX,
    myPathData.metaData.canvasTranslateY,
  ]);

  useEffect(() => {
    if (!imageBase64) {
      return;
    }
    Image.getSize(imageBase64, (width, height) => {
      // Calculate the scale factor
      console.log(width, height);
      const scaleFactor = Math.min(maxWidth / width, maxHeight / height);

      // Apply the scale factor to the original dimensions
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;

      setImageSize({ width: scaledWidth, height: scaledHeight });
    });
  }, [imageBase64]);
  // useEffect(() => {
  //   if(imageBase64) {
  //     return;
  //   }
  //   // Get the initial viewBox based on trimmed path data or CANVAS_WIDTH/HEIGHT if empty
  //   console.log(
  //     "GETTING INITIAL VIEWBOX.. why would points be empty here though",
  //   );
  //   const initialViewBox =
  //     getViewBoxTrimmed(myPathData.pathData) ||
  //     `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
  //   const [tx, ty, fW, fH] = initialViewBox.split(" ");

  //   const fullWidth = Math.max(parseFloat(fW), CANVAS_WIDTH);
  //   const fullHeight = Math.max(parseFloat(fH), CANVAS_HEIGHT);

  //   const viewBox = `${tx} ${ty} ${fullWidth} ${fullHeight}`; // Use the correct viewBox

  //   // console.log("New ViewBox", viewBox);
  //   setViewBox(viewBox);
  // }, [myPathData.pathData]);

  // useEffect(() => {
  //   const canvasScale = myPathData.metaData.canvasScale;
  //   const translateX = myPathData.metaData.canvasTranslateX;
  //   const translateY = myPathData.metaData.canvasTranslateY;

  //   const [tx, ty, fullWidth, fullHeight] = viewBox.split(" ");
  //   const fW = parseFloat(fullWidth);
  //   const fH = parseFloat(fullHeight);
  //   // Calculate initial rectangle dimensions and position based on initial viewBox
  //   const rectWidth = Math.round(fW * canvasScale);
  //   const rectHeight = Math.round(fH * canvasScale);
  //   const rectX = Math.round(
  //     (translateX + parseFloat(tx) + (fW - CANVAS_WIDTH) / 2) / canvasScale,
  //   );
  //   const rectY = Math.round(
  //     (translateY + parseFloat(ty) + (fH - CANVAS_HEIGHT) / 2) / canvasScale,
  //   );

  //   // console.log("rect is recalculated");
  //   setRect({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
  // }, [myPathData.metaData]);

  return (
    // <View
    //   style={{
    //     position: "absolute",
    //     bottom: 10,
    //     left: 10,
    //     width: maxWidth,
    //     height: maxHeight,
    //     overflow: "hidden", // Ensure SVG does not overflow the container
    //     alignContent: "center",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     backgroundColor: "#ffff0077",
    //     borderWidth: 1,
    //     borderColor: "blue",
    //   }}
    //   pointerEvents="none"
    // >
    <Image
      source={{ uri: imageBase64 }}
      style={{
        position: "absolute",
        bottom: 20,
        left: 10,
        width: imageSize.width,
        height: imageSize.height,
        borderWidth: 2,
        borderColor: MY_BLACK
      }}
      resizeMode="cover"
    />

    // </View>
  );
};

export default PreviewWindow;
