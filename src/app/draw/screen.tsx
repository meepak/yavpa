import React, { useState, useEffect } from "react";
import { Alert, Text, View, Modal, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgCanvas from "@/components/svg/canvas";
import PreviewScreen from "@/app/preview";
import BrowseScreen from "@/app/browse";
import createDrawControls from "@/app/draw/controls";
import {
  PathDataType,
  SvgDataType,
  createSvgData,
  saveSvgToFile,
} from "@/utilities/helper";
import Header from "@/app/draw/header";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const iosCurveOffset = 34;
const headerHeight = 34;
const footerHeight = 50 + iosCurveOffset; // this will be compensated in android by lifting footer content using marginBottom
const defaultViewBoxWidth = screenWidth - 10;
const defaultViewBoxHeight = screenHeight - headerHeight - footerHeight - 40 - iosCurveOffset;

const DrawScreen = () => {
  const [svgData, setSvgData] = useState(createSvgData(defaultViewBoxWidth, defaultViewBoxHeight));
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0);
  const [d3CurveBasis, setD3CurveBasis] = useState(null); //"auto", "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [previewMode, setPreviewMode] = useState(false);
  const [filesMode, setFilesMode] = useState(true); //default is true, test it

  const [editMode, setEditMode] = useState(true); //default is true, test item
  const [iAmVisible, setIAmVisible] = useState(true); // idea is to hide this screen when modal appears in transparent back ground

  const canvasLoaded = (layout: any) => {
  }

  const executeCommand = (cmd: string) => {
    setCommand(cmd);
    setCommandEnforcer((prev) => prev + 1)
  }


  const showFilesModal = (show = true) => {
    setIAmVisible((prevState) => !show);
    setFilesMode((prevState) => show);
  };

  const showPreviewModal = (show = true) => {
    setIAmVisible((prevState) => !show);
    setPreviewMode((prevState) => show);
  }

  const onNewPress = async () => {
    const resetSvgData = () => {
      setSvgData(createSvgData(defaultViewBoxWidth, defaultViewBoxHeight));
      executeCommand("reset");
    };

    if (svgData.pathData.length > 0 && (await saveSvgToFile(svgData))) {
      resetSvgData();
      return;
    }

    Alert.alert(
      "Discard changes?",
      "You have unsaved changes that couldn't be automatically saved." +
      " If you don't want to discard, please copy paste or download manually from preview section.",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Discard",
          onPress: resetSvgData,
        },
      ]
    );
  };

  const onUndo = () => executeCommand("undo");
  const onRedo = () => executeCommand("redo");

  const buttons = createDrawControls({
    showFilesModal,
    onNewPress,
    onUndo,
    onRedo,
    strokeWidth,
    setStrokeWidth,
    stroke,
    setStroke,
    simplifyTolerance,
    setSimplifyTolerance,
    d3CurveBasis,
    setD3CurveBasis,
    showPreviewModal,
  });

  const handleNameChange = (name: string) => {
    setSvgData((existingData) => ({
      metaData: {
        ...existingData.metaData,
        name,
      },
      pathData: existingData.pathData,
    }));  
  }

  // tp update viewBox here with trimmed area if that is user option
  const updateSvgData = (pathData: PathDataType[]) => {
    setSvgData((existingData) => ({
      metaData: existingData.metaData,
      pathData: pathData,
    }));
  };



  return (
    <>
     {iAmVisible
     ? <SafeAreaView style={{ flex: 1 }}>
        <Header 
          controlPanelButtons={buttons} 
          onNameChange={handleNameChange}
          isEditMode={editMode}
          setEditMode={(value) => setEditMode(value)}
        />
        <View
          style={{
            flex: 1,
            alignContent: "flex-start",
            justifyContent: "flex-start",
          }}
          onLayout={(event) => {canvasLoaded(event.nativeEvent.layout)}}
        >
          <SvgCanvas
            editMode={editMode}
            command={command}
            forceUpdate={commandEnforcer}
            onPathDataChange={updateSvgData}
            initialPathData={svgData.pathData}
            stroke={stroke}
            strokeWidth={strokeWidth}
            simplifyTolerance={simplifyTolerance}
            d3CurveBasis={d3CurveBasis}
          />
        </View>
      </SafeAreaView>
      : <></>}
      <Modal
        animationType="fade"
        transparent={true}
        visible={filesMode}
        onRequestClose={() => showFilesModal(false)}
      >
        <BrowseScreen
          onFileSelected={(data: SvgDataType) => {
            setSvgData(data);
            executeCommand("open");
          }}
          closeMe={() => showFilesModal(false)}
        />
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={previewMode}
        onRequestClose={() => showPreviewModal(false)}
      >
        <PreviewScreen
          svgData={svgData}
          closeMe={() => showPreviewModal(false)}
        />
      </Modal>
    </>
  );
};

export default DrawScreen;
