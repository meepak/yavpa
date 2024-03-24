import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import SvgCanvas from "./canvas";
import createDrawControls from "./control";
import { AvailableShapes, MY_BLACK, MyPathDataType } from "@u/types";
import { ToastContext } from "@x/toast-context";
import { pickImageAsync } from "@u/image-picker";
import { createImageData, createPathdata } from "@u/helper";


const DrawScreen = ({ myPathData, setMyPathData, initControls }) => {
  const [stroke, setStroke] = useState(MY_BLACK);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0.0111);
  const [d3CurveBasis, setD3CurveBasis] = useState(undefined); //"auto",null "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [shape, setShape] = useState(AvailableShapes[0]);
  const [editMode, setEditMode] = useState(true);
  const [erasureMode, setErasureMode] = useState(false);
  const { showToast } = useContext(ToastContext);


  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((prev) => prev + 1)
    } else {
      setCommand(cmd);
    }
  }

  useEffect(() => {
    executeCommand("open");

    // on leaving clear the controls
    return () => initControls([]);
  }, [])





  const onUndo = () => executeCommand("undo");
  const onRedo = () => executeCommand("redo");
  // const onLock = () => {
  //   const mode = editMode ? "lock" : "unlock";
  //   myConsole.log('mode', mode);
  //   setEditMode((prev) => !prev);
  // };

  const toggleErasure = () => {
    setErasureMode((prev) => !prev);
    // executeCommand("erase");
  }

  const drawShape = (shape) => {
    setShape(shape);
    executeCommand(shape);
  }

  const pickImage = async () => {
    const imageJson = await pickImageAsync(showToast);
    if(!imageJson) return;
    const newImageData = createImageData(imageJson.guid, imageJson.data, imageJson.width, imageJson.height);
    newImageData.type = "image";
    newImageData.visible = true;

    // let's just allow one image as a background for now
    setMyPathData((prev: MyPathDataType) => {
      return {
        ...prev,
        imageData: [newImageData],  // prev.imageData ? [...prev.imageData, newImageData] : [newImageData],
        metaData: { ...prev.metaData, updatedAt: "" },
        updatedAt: new Date().toISOString()

      };
    });
  }

  // const onSelectMode = () => executeCommand("select");

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
    pickImage
  });

  useEffect(() => {
    initControls(buttons)
  }, [stroke, strokeOpacity, strokeWidth, simplifyTolerance, d3CurveBasis, shape, myPathData])



  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgCanvas
        editable={editMode}
        erasing={erasureMode}
        command={command}
        forceUpdate={commandEnforcer}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        simplifyTolerance={simplifyTolerance}
        d3CurveBasis={d3CurveBasis}
      />
    </View>
  );
};

export default DrawScreen;
