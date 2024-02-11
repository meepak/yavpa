import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import simplify from "simplify-js";
import * as d3 from "d3";
import { createPathdata, getPathFromPoints, getPointsFromPath, getViewBoxTrimmed, PathDataType } from "@u/helper";
import { AvailableShapes, shapeData, calculateDistance, isValidShape, getD3CurveBasis } from "@u/shapes";

type SvgCanvasProps = {
  editable?: boolean;
  command?: string;
  forceUpdate?: number;
  onPathDataChange?: (arg0: PathDataType[]) => void;
  initialPathData?: PathDataType[];
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  precision?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any; // Replace 'any' with the actual type if known
};

const SvgCanvas: React.FC<SvgCanvasProps> = (props) => {
  const {
    editable = true,
    command = "",
    forceUpdate = 0,
    onPathDataChange = () => { },
    initialPathData = [],
    strokeWidth = 2,
    strokeOpacity = 1,
    stroke = "#000000",
    precision = 3,
    simplifyTolerance = 0,
    d3CurveBasis = null,
  } = props;

  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  const [completedPaths, setCompletedPaths] = useState(initialPathData as PathDataType[]);
  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(-1);
  // to draw various shapes
  const [currentShape, setCurrentShape] = useState({ name: "", start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  // for select mode
  const [editMode, setEditMode] = useState(editable);
  // selectedPaths hold 1 path and it's boundary box path
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPathIndex, setSelectedPathIndex] = useState(-1);
  const [selectedPaths, setSelectedPaths] = useState([] as PathDataType[]);

  useEffect(() => {
    setEditMode(editable);
  }, [editable])

  useEffect(() => {
    // console.log("command", command);
    if (!editMode) return;
    switch (command) {
      case "open":
      case "update": // TODO this command shouldn't be necessary..
        setCompletedPaths(() => initialPathData);
        setCurrentPath(() => newPathData()); //should we use newPathData instead?? ??
        // setUndonePaths(() => []);
        break;
      case "reset":
        setCompletedPaths(() => []);
        setCurrentPath(() => createPathdata()); //should we use newPathData instead?? NOPE
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
          console.log(undonePaths.length)
        }
        break;
      case "redo":
        console.log("redooo")
        if (undonePaths.length > 0) {
          console.log("redooo inside")
          setUndonePaths((prevUndonePaths) => prevUndonePaths.slice(0, -1));
          setCompletedPaths((prevCompletedPaths) => [
            ...prevCompletedPaths,
            undonePaths[undonePaths.length - 1],
          ]);
        }
        break;
      case "select":
        setSelectMode(true);
        break;
      default: // check for shapes
        setCurrentShape({ name: command, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
        break;
    }
  }, [command, forceUpdate]);

  useEffect(() => {
    if (selectMode) return;
    console.log('calling...onPathDataChange', command);
    onPathDataChange(completedPaths);
  }, [completedPaths]);


  const getLastPoint = (path: string) => {
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
    if (selectMode && selectedPaths.length > 0) {
      handleSelectedPathPanning(event, state);
      return;
    }

    if (!editMode) return;
    const pt = {
      x: parseFloat(event.x).toFixed(precision),
      y: parseFloat(event.y).toFixed(precision),
    };

    switch (state) {
      case "began":
        setStartTime(Date.now());

        const newPath = newPathData();
        setCurrentPath({ ...newPath, path: `M${pt.x},${pt.y}` });

        // shape takes precedance over path
        if (isValidShape(currentShape.name)) {
          setCurrentShape((prev) => {
            prev.start = { x: parseFloat(pt.x), y: parseFloat(pt.y) }
            return prev;
          });
        }
        break;
      case "active":
        if (isValidShape(currentShape.name)) {
          setCurrentShape((prev) => {
            prev.end = { x: parseFloat(pt.x), y: parseFloat(pt.y) }
            return prev;
          });
          const { path, length } = shapeData(currentShape);

          setCurrentPath({
            ...currentPath,
            path,
            length,
          });
          break;
        }

        if (currentPath.path !== "") {
          // console.log("currentPath", currentPath)
          const lastPoint = getLastPoint(currentPath.path);
          const length = currentPath.length + calculateDistance(lastPoint, pt);
          setCurrentPath({
            ...currentPath,
            path: `${currentPath.path}L${pt.x},${pt.y}`,
            length: length,
          });
        }
        break;
      case "ended":
        currentPath.time = Date.now() - startTime;

        if (isValidShape(currentShape.name)) {
          setCurrentShape((prev) => ({ ...prev, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }));
        }

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
            let curveBasis = getD3CurveBasis(d3CurveBasis);
            if(curveBasis) {
              const line = d3.line().curve(curveBasis);
              // Generate the path data
              currentPath.path = line(points) || ""; // Assign an empty string if line(points) is null.
            }
          }
        }

        currentPath.visible = true;
        setCompletedPaths((prev) => [...prev, currentPath]);
        // console.log("completedPaths", completedPaths);
        setCurrentPath(newPathData()); // redundant??
        setStartTime(-1);
        break;
      default:
        break;
    }
  };


  const pan = Gesture.Pan()
  pan.onBegin((event) => handleDrawingEvent(event, "began"))
    .onUpdate((event) => handleDrawingEvent(event, "active"))
    .onEnd((event) => handleDrawingEvent(event, "ended"));

  const tap = Gesture.Tap()
  tap.onEnd((event) => {
    if (!selectMode) return;
    // console.log('tap', event);
    const pt = {
      x: parseFloat(event.x as any).toFixed(precision),
      y: parseFloat(event.y as any).toFixed(precision),
    };
    if (selectedPaths.length > 0) {
      // if we are not inside boundary box, we restore selected path
      const boundary = selectedPaths.find((item) => item.guid === 'boundary-box');
      if (boundary) {
        const points = getPointsFromPath(boundary.path);
        const selected = points.find((point) => {
          return calculateDistance(point, pt) < 10;
        });
        if (!selected) {
          //put selectedPath back in completedPaths at selectedPathIndex
          setEditMode(true);
          setSelectMode(false); // set mode first to allow changes in completed bath get saved
          const path = selectedPaths[0];
          setCompletedPaths((paths) => {
            paths.splice(selectedPathIndex, 0, path);
            return paths;
          });
          setSelectedPaths(() => []);
          setSelectedPathIndex(-1);
          return;
        }
      }
      // if we tapped inside, existing selected path, no need to do anything
    } else {
      // we should get here only if we have no selected path or 
      const selected = completedPaths.find((item, index) => {
        const points = getPointsFromPath(item.path);
        const selected = points.find((point) => {
          return calculateDistance(point, pt) < 10;
        });
        setSelectedPathIndex(index);
        return selected;
      });


      if (selected) {
        setEditMode(false);
        setSelectMode(true);
        //remove from completed paths
        setCompletedPaths((paths) => paths.filter((item) => item.guid !== selected.guid));
        // add to selected paths
        setSelectedPaths(() => [selected]); //once this moves path may change though

        // get min max points form path and draw a boundary box
        const pathPoints = getPointsFromPath(selected.path);
        const minX = Math.min(...pathPoints.map((point) => point.x));
        const minY = Math.min(...pathPoints.map((point) => point.y));
        const maxX = Math.max(...pathPoints.map((point) => point.x));
        const maxY = Math.max(...pathPoints.map((point) => point.y));
        const points = [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ];

        const boundaryPath = `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}L${points[2].x},${points[2].y}L${points[3].x},${points[3].y}Z`;
        setSelectedPaths((paths) => [...paths, {
          path: boundaryPath,
          stroke: "red",
          strokeWidth: 5,
          length: 0,
          time: 0,
          visible: true,
          guid: 'boundary-box',
        }]);
      }
    }
  });

  const handleSelectedPathPanning = (event, state) => {
    const pt = {
      x: parseFloat(event.x).toFixed(precision),
      y: parseFloat(event.y).toFixed(precision),
    };

    switch (state) {
      case "began":
        // check if we are inside the boundary box
        const boundary = selectedPaths.find((item) => item.guid === 'boundary-box');
        if (boundary) {
          const points = getPointsFromPath(boundary.path);
          const selected = points.find((point) => {
            return calculateDistance(point, pt) < 10;
          });
          if (selected) {
            console.log('inside the boundary box');
          }
        }
        break;
      case "active":
        break;
      case "ended":
        break;
    }
  }

  const MyPath = (p: PathDataType, key: string) => (
    <Path
      key={key}
      d={p.path}
      stroke={p.stroke} 
      strokeWidth={p.strokeWidth} 
      strokeLinecap={p.strokeCap}
      strokeLinejoin={p.strokeJoin}
      opacity={p.strokeOpacity}
      fill="none" />
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <GestureDetector gesture={tap}>
          <View style={styles.container}>
            <Svg style={styles.svg}>
              {completedPaths.map((item, _index) => (
                item.visible
                  ? <MyPath {...item} key={item.guid} />
                  : <></>
              ))}
              <MyPath {...currentPath} key={'current-' + currentPath.guid} />
              {selectMode && selectedPaths.map((item, _index) => (
                <MyPath {...item} key={'selected-' + item.guid} />
              ))}
            </Svg>
          </View>
        </GestureDetector>
      </GestureDetector>
    </View>
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
