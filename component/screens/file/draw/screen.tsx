import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import SvgCanvas from "./canvas";
import createDrawControls from "./control";
import { AvailableShapes, PathDataType } from "@u/types";
import { SvgDataContext } from "@x/svg-data";


const DrawScreen = ({ zoom, initControls }) => {
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0.0111);
  const [d3CurveBasis, setD3CurveBasis] = useState(null); //"auto",null "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [shape, setShape] = useState(AvailableShapes[0]);
  const [editMode, setEditMode] = useState(true);
  // const [erasureMode, setErasureMode] = useState(false);


  const { svgData, setSvgData } = useContext(SvgDataContext);

  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((prev) => prev + 1)
    } else {
      setCommand(cmd);
    }
  }

  useEffect(() => {
    executeCommand("open");
  }, [])



  useEffect(() => {
    initControls(buttons)
  }, [stroke, strokeOpacity, strokeWidth, simplifyTolerance, d3CurveBasis, shape, svgData])




  const onUndo = () => executeCommand("undo");
  const onRedo = () => executeCommand("redo");
  // const onLock = () => {
  //   const mode = editMode ? "lock" : "unlock";
  //   console.log('mode', mode);
  //   setEditMode((prev) => !prev);
  // };

  // const toggleErasure = () => {
  //   setErasureMode((prev) => !prev);
  //   // executeCommand("erase");
  // }

  const drawShape = (shape) => {
    setShape(shape);
    executeCommand(shape);
  }


  // const onSelectMode = () => executeCommand("select");


  const buttons = createDrawControls({
    // onLock,
    svgData,
    setSvgData,
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
    // toggleErasure,
    // onSelectMode,
  });

  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
        <SvgCanvas
          editable={editMode} // to do get rid of this, as preview will act as read only mode
          // erasing={erasureMode}
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
