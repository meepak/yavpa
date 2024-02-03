import React, { useState } from "react";
import { Alert, View, Dimensions, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
import SvgCanvas from "@c/svg/canvas";
import createDrawControls from "@c/controls/page-controls/draw";
import { PathDataType, SvgDataType, createSvgData } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import Header from "@c/headers/draw";


const DrawScreen = () => {
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
  const [svgData, setSvgData] = useState(createSvgData(0, 0)); // Initialize with default values
  
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0);
  const [d3CurveBasis, setD3CurveBasis] = useState(null); //"auto", "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [previewMode, setPreviewMode] = useState(false);

  const [editMode, setEditMode] = useState(true); //default is true, test item

  const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL

  const canvasLoaded = (layout: any) => {
    if (canvasSize.width == 0 || canvasSize.height == 0) {
      // Update svgData once we have the actual values
      setSvgData((prev) => ({...prev, metaData: {...prev.metaData, viewBox: `0 0 ${layout.width} ${layout.height}`}})); 
      setCanvasSize({width: layout.width, height: layout.height});
    }
  }

  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((prev) => prev + 1)
    } else {
      setCommand(cmd);
    }
  }

  const showPreviewModal = (show = true) => {
    setPreviewMode(() => show);
  }

  async function openSvgDataFile(guid: string) {
    const svgDataFromFile = await getFile(guid);
    if (svgDataFromFile && 'pathData' in svgDataFromFile) {
      // console.log('File found with GUID: ', guid, 'name: ', svgDataFromFile.metaData.name)
      setSvgData(() => svgDataFromFile);
      executeCommand("open");
    } else {
      // TODO  handle error
      console.log('No file found with GUID: ', guid);
      resetSvgData();
    }
  }

  const resetSvgData = () => {
    setSvgData(createSvgData(canvasSize.width, canvasSize.height));
    executeCommand("reset");
  };

  const updateSvgData = (value: PathDataType[]) => {
      setSvgData((prevSvgData) => ({
        ...prevSvgData,
        pathData: value,
      }));
      // console.log('updating..');
      executeCommand("update");
  }

  const onNewPress = async () => {
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
    svgData,
    updateSvgData,
    showPreviewModal,
  });

  const handleNameChange = (name: string) => {
    setSvgData((existingData) => ({
      metaData: {
        ...existingData.metaData,
        name: name,
      },
      pathData: existingData.pathData,
    }));
  }

  // to update viewBox here with trimmed area if that is user option
  const handleSvgPathDataChange = (pathData: PathDataType[]) => {
    // console.log('pathdata udpated');
    setSvgData((existingData) => ({
      metaData: existingData.metaData,
      pathData: pathData,
    }));
  };


  React.useEffect(() => {
    if (guid) {
      // console.log(`Load file with GUID: ${guid}`);
      openSvgDataFile(guid);

    } else {
      resetSvgData();
    }
  }, [guid]);


  React.useEffect(() => { 
    // testing auto save to file (if not in preview mode) put as option??
    // console.log('saving...', svgData.metaData,guid)
    saveSvgToFile(svgData);
  }, [svgData]);

  return (
    <View style={{ flex: 1 }}>
      <Header
        controlPanelButtons={buttons}
        title={svgData?.metaData?.name || ""} 
        onTitleChange={handleNameChange}
        isEditMode={editMode}
        setEditMode={(value: boolean | ((prevState: boolean) => boolean)) => setEditMode(value)}
      />
      <View
        style={{
          flex: 1,
          alignContent: "flex-start",
          justifyContent: "flex-start",
        }}
        onLayout={(event) => { canvasLoaded(event.nativeEvent.layout) }}
      >
        <SvgCanvas
          editMode={editMode}
          command={command}
          forceUpdate={commandEnforcer}
          onPathDataChange={handleSvgPathDataChange}
          initialPathData={svgData.pathData}
          stroke={stroke}
          strokeWidth={strokeWidth}
          simplifyTolerance={simplifyTolerance}
          d3CurveBasis={d3CurveBasis}
        />
      </View>
    </View>
  );
};

export default DrawScreen;
