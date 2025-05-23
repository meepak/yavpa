import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import {
  AvailableShapes,
  CANVAS_PADDING_VERTICAL,
  HEADER_HEIGHT,
  MY_BLACK,
  type MyPathDataType,
} from "@u/types";
import { useToastContext } from "@x/toast-context";
import { pickImageAsync } from "@u/image-picker";
import { createImageData, createPathdata } from "@u/helper";
import { useMyPathDataContext } from "@x/svg-data";
import { useUserPreferences } from "@x/user-preferences";
import createDrawControls from "./control";
import SvgCanvas from "./canvas";

const DrawScreen = ({ initControls }) => {
  const { myPathData, setMyPathData } = useMyPathDataContext();
  const [stroke, setStroke] = useState(MY_BLACK);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0.0111);
  const [d3CurveBasis, setD3CurveBasis] = useState(undefined); // "auto",null "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // Since we may need to send same command, we use this increasing id to force update
  const [shape, setShape] = useState(AvailableShapes[0]);
  const [editMode, setEditMode] = useState(true);
  const [erasureMode, setErasureMode] = useState(false);
  const [enhancedDrawingMode, setEnhancedDrawingMode] = useState(false);
  const [snappingMode, setSnappingMode] = useState(false);
  const [pathEditingMode, setPathEditingMode] = useState(false);
  const { showToast } = useToastContext();
  const { undo, redo } = useMyPathDataContext();
  const { defaultStorageDirectory } = useUserPreferences();

  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((previous) => previous + 1);
    } else {
      setCommand(cmd);
    }
  };

  useEffect(() => {
    executeCommand("open");

    // On leaving clear the controls
    return () => initControls([]);
  }, []);

  const onUndo = () => {
    undo();
    setCommandEnforcer((previous) => previous + 1);
  };

  const onRedo = () => {
    redo();
    setCommandEnforcer((previous) => previous + 1);
  };
  // Const onLock = () => {
  //   const mode = editMode ? "lock" : "unlock";
  //   myConsole.log('mode', mode);
  //   setEditMode((prev) => !prev);
  // };

  const toggleErasure = () => {
    setErasureMode((previous) => !previous);
    // ExecuteCommand("erase");
  };

  const toggleEnhancedDrawing = () => {
    setEnhancedDrawingMode((previous) => {
      const val = !previous;
      setPathEditingMode(false);
      setEditMode(true);
      showToast("Enhanced drawing mode is " + (val ? "on" : "off"));
      return val;
    });
  };

  const toggleSnapping = () => {
    setSnappingMode((previous) => {
      const val = !previous;
      showToast("Point snapping " + (val ? "on" : "off"));
      return val;
    });
  }

  const togglePathEditing = () => {
    setPathEditingMode((previous) => !previous);
  };

  const drawShape = (shape) => {
    setShape(shape);
    executeCommand(shape);
  };

  const pickImage = async () => {
    const imageJson = await pickImageAsync(defaultStorageDirectory, showToast);
    if (!imageJson) {
      return;
    }

    const newImageData = createImageData(
      imageJson.guid,
      imageJson.data,
      imageJson.width,
      imageJson.height,
    );
    newImageData.type = "image";
    newImageData.visible = true;

    // Let's just allow one image as a background for now
    setMyPathData((previous: MyPathDataType) => ({
      ...previous,
      imageData: [newImageData], // Prev.imageData ? [...prev.imageData, newImageData] : [newImageData],
      metaData: { ...previous.metaData, updatedAt: "" },
      updatedAt: new Date().toISOString(),
    }));
  };

  // Const onSelectMode = () => executeCommand("select");

  const buttons = createDrawControls({
    myPathData,
    setMyPathData,
    onUndo,
    onRedo,
    strokeWidth,
    setStrokeWidth,
    stroke,
    setStroke,
    strokeOpacity,
    setStrokeOpacity,
    simplifyTolerance,
    setSimplifyTolerance,
    d3CurveBasis,
    setD3CurveBasis,
    shape,
    drawShape,
    toggleErasure,
    pickImage,
    toggleEnhancedDrawing,
    togglePathEditing,
    toggleSnapping
  });

  useEffect(() => {
    initControls(buttons);
  }, [
    stroke,
    strokeOpacity,
    strokeWidth,
    simplifyTolerance,
    d3CurveBasis,
    shape,
    myPathData,
  ]);

  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgCanvas
        editable={editMode}
        erasing={erasureMode}
        enhancedDrawing={enhancedDrawingMode}
        snapToNearestPoint={snappingMode}
        pathEditing={pathEditingMode}
        command={command}
        forceUpdate={commandEnforcer}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        simplifyTolerance={simplifyTolerance}
        d3CurveBasis={d3CurveBasis}
        canvasScaleProp={myPathData.metaData.canvasScale || 1}
        canvasTranslateProp={{
          x: myPathData.metaData.canvasTranslateX || 0,
          y: myPathData.metaData.canvasTranslateY || 0,
        }}
      />
    </View>
  );
};

export default DrawScreen;
