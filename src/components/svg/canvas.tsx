import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import simplify from "simplify-js";
import * as d3 from "d3";
import { createPathdata, getPathFromPoints, getPointsFromPath, PathDataType } from "@/utilities/helper";

const SvgCanvas = ({
  editMode = true,
  command = "",
  forceUpdate = 0, //command may not change but we want it executed again again if they are issued
  onPathDataChange = ([]: PathDataType[]) => {},
  initialPathData = [] as PathDataType[],
  strokeWidth = 3,
  stroke = "black",
  precision = 3,
  simplifyTolerance = 0,
  d3CurveBasis = null,
}) => {
  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  const [completedPaths, setCompletedPaths] = useState(initialPathData as PathDataType[]);
  const [currentPath, setCurrentPath] = useState({
    path: "",
    length: 0,
    time: 0,
    stroke: stroke,
    strokeWidth: strokeWidth,
  });
  const [startTime, setStartTime] = useState(-1);
  // const [prevVelocityX, setPrevVelocityX] = useState(0);
  // const [prevVelocityY, setPrevVelocityY] = useState(0);
 

  useEffect(() => {
    // console.log("command", command);
    if(!editMode) return;
    switch (command) {
      case "open":
        setCompletedPaths(() => initialPathData);
        setCurrentPath(() => createPathdata());
        setUndonePaths(() => []);
        break;
      case "reset":
        setCompletedPaths(() => []);
        setCurrentPath(() => createPathdata());
        setUndonePaths(() => []);
        break;
      case "undo":
        if (completedPaths.length > 0) {
          setCompletedPaths((prevCompletedPaths) =>
            prevCompletedPaths.slice(0, -1)
          );
          setUndonePaths((prevUndonePaths) => [
            ...prevUndonePaths,
            completedPaths[completedPaths.length - 1],
          ]);
        }
        break;
      case "redo":
        if (undonePaths.length > 0) {
          setUndonePaths((prevUndonePaths) => prevUndonePaths.slice(0, -1));
          setCompletedPaths((prevCompletedPaths) => [
            ...prevCompletedPaths,
            undonePaths[undonePaths.length - 1],
          ]);
        }
        break;
      default:
        break;
    }
    command = "";
  }, [command, forceUpdate]);

  useEffect(() => {
    onPathDataChange && onPathDataChange(completedPaths);
  }, [completedPaths]);

  // const velocityHasChanged = (velocityX, velocityY) => {
  //   const diffX = Math.abs(velocityX - prevVelocityX);
  //   const diffY = Math.abs(velocityY - prevVelocityY);
  //   const threshold = 0.1; // Adjust this value as needed
  //   return diffX > threshold || diffY > threshold;
  // };

  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // console.log("distance", distance, point1, point2);
    return distance;
  };

const getLastPoint = (path) => {
  // split function to use a regular expression that splits the string 
  // at the position before any SVG command letter.
  const commands = path.trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
  const lastCommand = commands[commands.length - 1];
  const commandType = lastCommand[0].toUpperCase();
  const parameters = lastCommand.slice(1).split(",");
  let x = parameters[parameters.length - 2];
  let y = parameters[parameters.length - 1];

  return { commandType, x: parseFloat(x), y: parseFloat(y) };
};

  const handleDrawingEvent = (event, state) => {
    if(!editMode) return;
    const pt = {
      x: parseFloat(event.x).toFixed(precision),
      y: parseFloat(event.y).toFixed(precision),
    };
    switch (state) {
      case "began":
        setCurrentPath({...currentPath, path: `M${pt.x},${pt.y}`});
        setStartTime(Date.now());
        // setPrevVelocityX(event.velocityX);
        // setPrevVelocityY(event.velocityY);
        break;
      case "active":
        // if (velocityHasChanged(event.velocityX, event.velocityY)) {
        //   setCompletedPaths((prev) => [
        //     ...prev,
        //     {
        //       path: currentPath.path,
        //       time: Date.now() - startTime,
        //       // length: currentPath.length,
        //     },
        //   ]);
        //   setCurrentPath({ path: `M${pt.x},${pt.y}`, length: 0 });
        //   setStartTime(Date.now());
        // } else {
        if (currentPath.path !== "") {
          // console.log("currentPath", currentPath)
          const lastPoint = getLastPoint(currentPath.path);
          const length = currentPath.length + calculateDistance(lastPoint, pt);
          setCurrentPath({...currentPath, 
            path: `${currentPath.path}L${pt.x},${pt.y}`,
            length: length,
          });
        }
        break;
        // }
        // setPrevVelocityX(event.velocityX);
        // setPrevVelocityY(event.velocityY);
        break;
      case "ended":
        currentPath.time = Date.now() - startTime;

        // console.log("path", currentPath.path);
        if (simplifyTolerance > 0) {
          const points = getPointsFromPath(currentPath.path);
          if (points.length >= 2) {
            const simplifiedPoints = simplify(points, simplifyTolerance); // Adjust tolerance as needed
            currentPath.path = getPathFromPoints(simplifiedPoints);
          }
        }

        if (d3CurveBasis) {
          const points = getPointsFromPath(currentPath.path).map((point) => [
            point.x,
            point.y,
          ]);
          if (points.length >= 2) {
            // Create a line generator
            let curveBasis = d3.curveBasis;
            if (d3CurveBasis === "closed") {
              curveBasis = d3.curveBasisClosed;
            } else if (d3CurveBasis === "open") {
              curveBasis = d3.curveBasisOpen;
            };
            const line = d3.line().curve(curveBasis);
            // Generate the path data
            currentPath.path = line(points) || ""; // Assign an empty string if line(points) is null.
          }
        }
        // console.log("simplified", currentPath.path);
        currentPath.stroke = stroke;
        currentPath.strokeWidth = strokeWidth;
        completedPaths.push(currentPath);
        setCompletedPaths((prev) => completedPaths);
        // console.log("completedPaths", completedPaths);
        setCurrentPath({...currentPath, path: "", length: 0});
        setStartTime(-1);
        break;
      default:
        break;
    }
  };

  const pan = Gesture.Pan();
    pan.onBegin((event) => handleDrawingEvent(event, "began"))
      .onUpdate((event) => handleDrawingEvent(event, "active"))
      .onEnd((event) => handleDrawingEvent(event, "ended"));
  
  
    // const scale = useRef(new Animated.Value(1)).current;
    // const translateX = useRef(new Animated.Value(0)).current;
    // const translateY = useRef(new Animated.Value(0)).current;
  
    // const onPinchEvent = Animated.event([{ nativeEvent: { scale: scale } }], { useNativeDriver: true });
    // pan.onChange((event) => {Animated.event([{ nativeEvent: { translationX: translateX, translationY: translateY } }], { useNativeDriver: true })});
  

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={pan}>
        <View style={styles.container}>
          <Svg style={styles.svg}>
            {completedPaths.map((item, index) => (
              <Path
                key={index}
                d={item.path}
                stroke={item.stroke}
                strokeWidth={item.strokeWidth}
                fill="none"
              />
            ))}
            <Path
              d={currentPath.path}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  svg: {
    flex: 1,
  },
});

export default SvgCanvas;
