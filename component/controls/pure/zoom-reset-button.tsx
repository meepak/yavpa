import { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useMyPathDataContext } from "@x/svg-data";
import MyBlueButton from "./my-blue-button";
import { precise, scaleToZoom } from "@u/helper";
import { useToastContext } from "@x/toast-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Only used in draw>screen, If we need to place this button in other screens,
// we can add the bottom/aligned as part of props and refacctor
const ZoomResetButton = () => {
  const { myPathData, setMyPathData } = useMyPathDataContext();
  const { showToast } = useToastContext();
  const insets = useSafeAreaInsets();

  if (
    myPathData.metaData.canvasScale === 1 &&
    myPathData.metaData.canvasTranslateX === 0 &&
    myPathData.metaData.canvasTranslateY === 0
  ) {
    return null;
  }

  const Label = () => (
    <View
      style={{
        marginLeft: 5,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 1,
          opacity: 1,
        }}
      >
        {scaleToZoom(myPathData.metaData.canvasScale) + "%"}
      </Text>
      <Text
        allowFontScaling={true}
        style={{
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: "300",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          opacity: 1,
        }}
      >
        {precise(myPathData.metaData.canvasTranslateX, 0) +
          ", " +
          precise(myPathData.metaData.canvasTranslateY, 0)}
      </Text>
    </View>
  );

  return (
    <MyBlueButton
      aligned="right"
      bottom={insets.bottom + 16}
      bgColor={"#08256777"}
      bgPressedColor={"#00224477"}
      icon={{ desc: "", name: "zoom", size: 22, margin: -17 }}
      text={() => <Label />}
      onPress={() => {
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
    />
  );
};

export default ZoomResetButton;
