import React, { useState, useEffect, useRef } from "react";
import { Text, View, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgPreview from "@/components/svg/preview";
import ControlPanel from "@/components/control-panel"; 
import createPreviewControls from "@/app/preview/controls";
import ExportScreen from "@/app/export";

const PreviewScreen = ({ svgData, closeMe }) => {
  const [exportMode, setExportMode] = useState(false);
  const previewRef = useRef(null);
  const [speed, setSpeed] = useState(1);

  const onPreviewLoop = () => previewRef?.current?.loopAnimation(); // this doesn't work
  const onPreviewReplay = () => previewRef?.current?.replayAnimation();
  const onPreviewPlay = () => previewRef?.current?.playAnimation();
  const onPreviewStop = () => previewRef?.current?.stopAnimation();
  const speedChange = (factor) => {
    previewRef?.current?.animationSpeed(speed / factor);
    setSpeed((speed) => speed / factor);
  };

  useEffect(() => {
    onPreviewPlay();
  }, [previewRef]);

  // In your component:
  const buttons = createPreviewControls({
    onPreviewLoop,
    onPreviewReplay,
    onPreviewStop,
    speed,
    speedChange,
    setExportMode,
    closeMe,
  });

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            alignSelf: "stretch",
            borderBottomWidth: 1,
            borderBottomColor: "black",
          }}
        >
          <Text
            style={{
              color: "black",
              fontSize: 30,
              marginBottom: 15,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Preview Screen!
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <SvgPreview ref={previewRef} svgData={svgData} />
        </View>
        <View
          style={{
            alignSelf: "stretch",
            borderTopWidth: 1,
            borderTopColor: "black",
          }}
        >
          <ControlPanel buttons={buttons} />
        </View>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={false}
        visible={exportMode}
        onRequestClose={() => setExportMode(false)}
      >
        <ExportScreen svgData={svgData} closeMe={() => setExportMode(false)} />
      </Modal>
    </>
  );
};

export default PreviewScreen;
