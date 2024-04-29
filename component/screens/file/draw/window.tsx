import React, { useContext, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Rect, G, Circle } from "react-native-svg";
import MyPath from "@c/controls/pure/my-path"; // Assuming MyPath renders paths
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import { getViewBoxTrimmed } from "@u/helper";

const PreviewWindow = ({ maxHeight, maxWidth }) => {
  const { myPathData, setMyPathData } = useContext(MyPathDataContext);
  const [viewBox, setViewBox] = useState("0 0 0 0");
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });


  useEffect(() => {
    const canvasScale = myPathData.metaData.canvasScale;
    const translateX = myPathData.metaData.canvasTranslateX;
    const translateY = myPathData.metaData.canvasTranslateY;

    // Get the initial viewBox based on trimmed path data or CANVAS_WIDTH/HEIGHT if empty
    const initialViewBox =
      getViewBoxTrimmed(myPathData.pathData) ||
      `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
    const [tx, ty, fW, fH] = initialViewBox.split(" ");

    const fullWidth = Math.max(parseFloat(fW), CANVAS_WIDTH);
    const fullHeight = Math.max(parseFloat(fH), CANVAS_HEIGHT);

    const viewBox = `${tx} ${ty} ${fullWidth} ${fullHeight}`; // Use the correct viewBox

    setViewBox(viewBox);

    // Calculate initial rectangle dimensions and position based on initial viewBox
   const rectWidth = Math.round(fullWidth * canvasScale);
   const rectHeight = Math.round(fullHeight * canvasScale);
   const rectX = Math.round(
     (translateX + parseFloat(tx) + (fullWidth - CANVAS_WIDTH) / 2) /
       canvasScale,
   );
   const rectY = Math.round(
     (translateY + parseFloat(ty) + (fullHeight - CANVAS_HEIGHT) / 2) /
       canvasScale,
   );

    setRect({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
  }, [myPathData.pathData, myPathData.metaData]);


  return (
      <View
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          backgroundColor: "#ffff00",
          width: maxWidth,
          height: maxHeight,
          overflow: "hidden", // Ensure SVG does not overflow the container
        }}
      >

    <Pressable
      onPressIn={() => {}}
      onLongPress={() => {
        setMyPathData((prev) => ({
          ...prev,
          metaData: {
            ...prev.metaData,
            canvasScale: 1,
            canvasTranslateX: 0,
            canvasTranslateY: 0,
            updatedAt: "",
          },
          updatedAt: new Date().toISOString(),
        }));
      }}
    >
        <Svg width="100%" height="100%" viewBox={viewBox}>
          <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="rgba(255, 0, 0, 0.2)"
            stroke="red"
            strokeWidth={2}
          />
          <G>
            {/* Render your paths using MyPath */}
            {myPathData.pathData.map((item, index) =>
              item.visible ? (
                <MyPath
                  key={item.guid}
                  prop={item}
                  keyProp={`rect+${item.guid}`}
                />
              ) : null,
            )}
            {/* If needed, render circles directly if not using MyPath */}
            {/* <Circle cx="50" cy="50" r="20" fill="blue" /> */}
          </G>
        </Svg>
    </Pressable>
      </View>
  );
};

export default PreviewWindow;
