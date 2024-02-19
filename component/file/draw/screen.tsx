import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import SvgCanvas from "./canvas";
import createDrawControls from "./control";
import { PathDataType } from "@u/types";
import { AvailableShapes } from "@u/shapes";
import { SvgDataContext } from "@x/svg-data";
import { saveSvgToFile } from "@u/storage";



const DrawScreen = ({ initControls }) => {
  // const { svgData, setSvgData } = useContext(SvgDataContext);
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0);
  const [d3CurveBasis, setD3CurveBasis] = useState(null); //"auto", "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [shape, setShape] = useState(AvailableShapes[0]);
  const [editMode, setEditMode] = useState(true);
  const [erasureMode, setErasureMode] = useState(false);

  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((prev) => prev + 1)
    } else {
      setCommand(cmd);
    }
  }

  // useEffect(() => {
  //   console.log('recursive probably');
  //   executeCommand("update");
  // }, [commandOVerride])  

  // useEffect(() => {
  //   console.log('commandEnforcer probably', commandEnforcer, command);
  // }, [commandEnforcer])


  useEffect(() => {
    executeCommand("open");
  }, [])

  // without this it doesn't display anything in the canvas
  //   React.useEffect(() => { 
  //     console.log("use effect update")
  //   executeCommand("update");
  // }, [svgData]);

  // const updateSvgData = (value: PathDataType[]) => {
  //     setSvgData((prevSvgData) => ({
  //       ...prevSvgData,
  //       pathData: value,
  //     }));
  //     console.log('updating..');
  //     executeCommand("update");
  // }

  const onUndo = () => executeCommand("undo");
  const onRedo = () => executeCommand("redo");
  // const onLock = () => {
  //   const mode = editMode ? "lock" : "unlock";
  //   console.log('mode', mode);
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

  // const onSelectMode = () => executeCommand("select");


  const buttons = createDrawControls({
    // onLock,
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
    // onSelectMode,
  });

  // update svgdata with new path data
  // const handleSvgPathDataChange = (pathData: PathDataType[]) => {
  //   const updatedSvgData = {
  //     metaData: svgData.metaData,
  //     pathData: pathData,
  //   };
  //   console.log('saving file')
  //   saveSvgToFile(updatedSvgData);
  //   setSvgData(updatedSvgData);
  //   executeCommand("update");
  // };

  useEffect(() => {
    initControls(buttons)
  }, [stroke, strokeOpacity, strokeWidth, simplifyTolerance, d3CurveBasis, shape])



  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgCanvas
        editable={editMode} // to do get rid of this, as preview will act as read only mode
        erasing={erasureMode}
        command={command}
        forceUpdate={commandEnforcer}
        // onPathDataChange={handleSvgPathDataChange}
        // initialPathData={svgData.pathData}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        simplifyTolerance={simplifyTolerance}
        d3CurveBasis={d3CurveBasis}
        // viewBox={svgData.metaData.viewBox}
      />
    </View>
  );
};

export default DrawScreen;
