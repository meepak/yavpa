import React, { useContext, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Rect, G, Circle } from "react-native-svg";
import MyPath from "@c/controls/pure/my-path"; // Assuming MyPath renders paths
import { CANVAS_WIDTH, CANVAS_HEIGHT, MY_BLACK } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import { getViewBoxTrimmed } from "@u/helper";
import { ToastContext } from "@x/toast-context";
import { StrokeWidth } from "@c/controls";

const PreviewWindow = ({ maxHeight, maxWidth }) => {
  const { myPathData, setMyPathData } = useContext(MyPathDataContext);
  const { showToast } = useContext(ToastContext);
  const [viewBox, setViewBox] = useState("0 0 0 0");
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    // Get the initial viewBox based on trimmed path data or CANVAS_WIDTH/HEIGHT if empty
    console.log('GETTING INITIAL VIEWBOX.. why would points be empty here though');
    const initialViewBox =
      getViewBoxTrimmed(myPathData.pathData) ||
      `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
    const [tx, ty, fW, fH] = initialViewBox.split(" ");

    const fullWidth = Math.max(parseFloat(fW), CANVAS_WIDTH);
    const fullHeight = Math.max(parseFloat(fH), CANVAS_HEIGHT);

    const viewBox = `${tx} ${ty} ${fullWidth} ${fullHeight}`; // Use the correct viewBox

    console.log("New ViewBox", viewBox);
    setViewBox(viewBox);
  }, [myPathData.pathData]);

  useEffect(() => {
    const canvasScale = myPathData.metaData.canvasScale;
    const translateX = myPathData.metaData.canvasTranslateX;
    const translateY = myPathData.metaData.canvasTranslateY;

    const [tx, ty, fullWidth, fullHeight] = viewBox.split(" ");
    const fW = parseFloat(fullWidth);
    const fH = parseFloat(fullHeight);
    // Calculate initial rectangle dimensions and position based on initial viewBox
    const rectWidth = Math.round(fW * canvasScale);
    const rectHeight = Math.round(fH * canvasScale);
    const rectX = Math.round(
      (translateX + parseFloat(tx) + (fW - CANVAS_WIDTH) / 2) / canvasScale,
    );
    const rectY = Math.round(
      (translateY + parseFloat(ty) + (fH - CANVAS_HEIGHT) / 2) / canvasScale,
    );

    console.log("rect is recalculated");

    setRect({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });
  }, [myPathData.metaData]);

  return (
    <Pressable
      onPressIn={() => {
        console.log("pressed in");
        setPressed(true);
      }}
      onPressOut={() => {
        console.log("pressed out");
        setPressed(false);
      }}
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
        showToast("Canvas scale, translate reset");
      }}
      style={{
        position: "absolute",
        bottom: 30,
        right: 30,
        width: maxWidth,
        height: maxHeight,
        overflow: "hidden", // Ensure SVG does not overflow the container
      }}
    >
      <View
        style={{
          flex: 1,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? "ff000044" : "#ffff0044",
          borderWidth: 1, borderColor: 'blue'}}
      >
          <Svg viewBox={viewBox} style={{borderWidth:4, borderColor: 'blue'}}>
          <G>
            {/* Render your paths using MyPath */}
            {[...myPathData.pathData].map((item, index) =>
              item.visible ? (
                <MyPath
                  key={item.guid}
                  prop={{...item, strokeWidth:4}}
                  keyProp={`rect+${item.guid}`}
                />
              ) : null,
            )}
          </G>
          <Rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="rgba(255, 0, 0, 0.2)"
            stroke={MY_BLACK}
            strokeWidth={2}
          />
        </Svg>
      </View>
    </Pressable>
  );
};

export default PreviewWindow;
