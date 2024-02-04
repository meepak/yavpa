import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import SvgCanvas from "@c/svg/canvas";
import createDrawControls from "@c/controls/page-controls/draw";
import { PathDataType } from "@u/helper";
import { AvailableShapes } from "@u/shapes";
import { SvgDataContext } from "./context";



const DrawScreen = ({initControls}) => {
  const {svgData, setSvgData} = useContext(SvgDataContext);
  const [stroke, setStroke] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0);
  const [d3CurveBasis, setD3CurveBasis] = useState(null); //"auto", "open", "closed", null
  const [command, setCommand] = useState("");
  const [commandEnforcer, setCommandEnforcer] = useState(0); // since we may need to send same command, we use this increasing id to force update
  const [shape, setShape] = useState(AvailableShapes[0]);

  const executeCommand = (cmd: string) => {
    if (command === cmd) {
      setCommandEnforcer((prev) => prev + 1)
    } else {
      setCommand(cmd);
    }
  }


  const updateSvgData = (value: PathDataType[]) => {
      setSvgData((prevSvgData) => ({
        ...prevSvgData,
        pathData: value,
      }));
      // console.log('updating..');
      executeCommand("update");
  }

  const onUndo = () => executeCommand("undo");
  const onRedo = () => executeCommand("redo");

  const drawShape = (shape) => {
    setShape(shape);
    executeCommand(shape);
  }
  

  const buttons = createDrawControls({
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
    shape,
    drawShape,
  });

  // update svgdata with new path data
  const handleSvgPathDataChange = (pathData: PathDataType[]) => {
    // console.log('pathdata udpated');
    setSvgData((existingData) => ({
      metaData: existingData.metaData,
      pathData: pathData,
    }));
  };

   // useEffect(() => {
  //   executeCommand("open");
  // }, [])


  React.useEffect(() => { 
    executeCommand("update");
  }, [svgData]);

  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
        <SvgCanvas
          editMode={true} // to do get rid of this, as preview will act as read only mode
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
  );
};

export default DrawScreen;
