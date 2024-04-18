// BoundaryBox.tsx
import React, { useContext } from "react";
import { View } from "react-native";
import { doPathIntersect, getViewBoxTrimmed } from "@u/helper";
import { CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import { ToastContext } from "@x/toast-context";

import MyIcon from "../../controls/pure/my-icon";
import { Divider } from "../../controls";
import { duplicateSelected } from "./duplicate";
import { flipPaths } from "./flip-path";
import { deleteSelected } from "./delete";
import { unselect } from "./unselect";
import { closePath } from "./close-path";
import { PathStyleType, copyStyle, pasteStyle } from "./copy-paste-style";
import { operation } from "./boolean-operation";

const BbIcon = ({
  name,
  onPress,
  strokeWidth = 1,
  size = 20,
  marginBottom = 0,
  marginLeft = 5,
  color = "#6b0772",
  fill = "none",
}) => (
  <MyIcon
    name={name}
    size={size}
    color={color ?? "#6b0772"}
    strokeWidth={strokeWidth}
    fill={fill}
    onPress={onPress}
    style={{ marginLeft, marginBottom }}
  />
);

const MyDivider = () => (
  <Divider
    horizontal={true}
    width={20}
    height={2}
    color={"rgba(0,0,0,0.5)"}
    margin={6}
  />
);

const BoundaryBoxIcons = ({
  canvasScale,
  canvasTranslate,
  activeBoundaryBoxPath,
  scaleMode,
  onScaleModeChange,
}) => {
  if (!activeBoundaryBoxPath?.visible) {
    return null;
  }

  const { myPathData, setMyPathData } = useContext(MyPathDataContext);
  const { showToast } = useContext(ToastContext);


const [styleClipBoard, setStyleClipBoard] = React.useState<
  PathStyleType | undefined
>();

  const handleScaleModePress = (mode: string) => {
    onScaleModeChange(mode);
    showToast("Scale axis changed to " + mode + " axis");
  };

  const selectedPaths = myPathData.pathData.filter(
    (item) => item.selected === true,
  );
  const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
  const vbbPoints = vbbox.split(" "); // This is relative to canvas
  const canvasPoints = CANVAS_VIEWBOX_DEFAULT.split(" "); // This is relative to screen

  const iconBoxWidth = 36;
  const iconBoxHeight = 32;
  const start = {
    x:
      Number.parseFloat(vbbPoints[0]) +
      Number.parseFloat(vbbPoints[2]) +
      Number.parseFloat(canvasPoints[0]),
    y:
      Number.parseFloat(vbbPoints[1]) + Number.parseFloat(canvasPoints[1]) + 25,
  };

  if (start.x + iconBoxWidth * 2 > CANVAS_WIDTH) {
    start.x = CANVAS_WIDTH - iconBoxWidth * 2;
  }

  if (start.y + iconBoxHeight > CANVAS_HEIGHT) {
    start.y = CANVAS_HEIGHT - iconBoxHeight;
  }

  const top = start.y - 15 < 0 ? 0 : start.y;
  const left = start.x < 0 ? 0 : start.x + 5;

  return (
    <View
      style={{
        width: 36 * 2, // Auto/
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        position: "absolute",
        top: top * canvasScale + canvasTranslate.y,
        left: left * canvasScale + canvasTranslate.x,
      }}
    >
      <View
        style={{
          width: 36, // Auto/
          height: iconBoxHeight * 7 + 5,
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          borderRadius: 10,
          backgroundColor: "rgba(150,150,250, 0.85)",
          borderWidth: 0.7,
          borderColor: "rgba(0,0,0,0.5)",
          padding: 7,
          paddingBottom: 7,
        }}
      >
        <BbIcon
          size={18}
          marginBottom={1}
          strokeWidth={1.4}
          name={"duplicate"}
          onPress={() => duplicateSelected(setMyPathData, showToast)}
        />

        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          marginBottom={1}
          strokeWidth={2}
          name={"flip-horizontal"}
          onPress={() => {
            () => flipPaths(setMyPathData, showToast, true, false);
          }}
        />
        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          strokeWidth={2}
          name={"flip-vertical"}
          onPress={() => {
            flipPaths(setMyPathData, showToast, true, false);
          }}
        />
        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          color={scaleMode === "X" ? "#4b0772" : undefined}
          strokeWidth={scaleMode === "X" ? 15 : 8}
          name={"stretch-x"}
          onPress={() => {
            handleScaleModePress(scaleMode === "X" ? "XY" : "X");
          }}
        />
        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          color={scaleMode === "Y" ? "#4b0772" : undefined}
          strokeWidth={scaleMode === "Y" ? 15 : 8}
          name={"stretch-y"}
          onPress={() => {
            handleScaleModePress(scaleMode === "Y" ? "XY" : "Y");
          }}
        />
        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          marginBottom={2}
          name={"trash"}
          onPress={() => deleteSelected(setMyPathData, showToast)}
        />
        <MyDivider />
        <BbIcon
          size={20}
          color="blue"
          marginLeft={0}
          marginBottom={2}
          name={"ok"}
          onPress={() => unselect(setMyPathData)}
        />
      </View>
      <View
        style={{
          width: 36, // Auto/
          height: "auto",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          borderRadius: 10,
          backgroundColor: "rgba(150,150,250, 0.85)",
          borderWidth: 0.7,
          borderColor: "rgba(0,0,0,0.5)",
          padding: 7,
          paddingBottom: 7,
        }}
      >
        {selectedPaths.length === 1 && !selectedPaths[0].path.endsWith("Z") && (
          <>
            <BbIcon
              size={18}
              marginBottom={1}
              strokeWidth={3}
              name={"close-path"}
              onPress={() => closePath(setMyPathData, showToast)}
            />
            <MyDivider />
          </>
        )}

        <BbIcon
          size={18}
          marginBottom={1}
          strokeWidth={1.4}
          name={"copy"}
          onPress={() => copyStyle(myPathData, showToast, setStyleClipBoard)}
        />
        <MyDivider />
        <BbIcon
          size={18}
          marginLeft={0}
          marginBottom={1}
          strokeWidth={2}
          name={"paste"}
          onPress={() => pasteStyle(setMyPathData, showToast, styleClipBoard)}
        />
        {selectedPaths.length === 2 &&
          doPathIntersect(selectedPaths[0].path, selectedPaths[1].path) && (
            <>
              <MyDivider />
              <BbIcon
                size={18}
                marginLeft={0}
                strokeWidth={1}
                color="#000000"
                fill="#000000"
                name={"union"}
                onPress={() => {
                  operation(setMyPathData, myPathData, showToast, "union");
                }}
              />

              <MyDivider />
              <BbIcon
                size={18}
                marginLeft={0}
                strokeWidth={2}
                name={"intersection"}
                fill="#000000"
                onPress={() => {
                  operation(setMyPathData, myPathData, showToast, "intersect");
                }}
              />
              <MyDivider />
              <BbIcon
                size={18}
                marginLeft={0}
                strokeWidth={2}
                fill="#000000"
                name={"difference"}
                onPress={() => {
                  operation(setMyPathData, myPathData, showToast, "difference");
                }}
              />
            </>
          )}
      </View>
    </View>
  );
};

export default BoundaryBoxIcons;
