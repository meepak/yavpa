import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Circle, Path, Rect } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Brushes, getBrush } from "@c/controls/my-brushes";
import { getCommandsFromPath, getPathLength, isValidPath } from "@u/helper";
import myConsole from "./my-console-log";
import { runOnJS } from "react-native-reanimated";
import {path as d3Path} from "d3-path";
import { getPointsFromPath } from '@u/helper';

const DraggableMarker = ({ command, onMove }) => {
  const panMarker = Gesture.Pan().onUpdate((event) => {
    // If using Reanimated, ensure to pass data via runOnJS or similar if needed.
    runOnJS(onMove)({ x: event.translationX, y: event.translationY });
  });

  const shapeProps = {
    M: {
      component: Rect,
      props: { fill: "green", x: -10, y: -10, width: 20, height: 20 },
    },
    L: {
      component: Rect,
      props: { fill: "blue", x: -10, y: -10, width: 20, height: 20 },
    },
    C: { component: Circle, props: { fill: "yellow", r: 10 } },
  };

  const Shape = shapeProps[command.command]?.component || Circle;
  const shapePropsAdjusted = {
    ...shapeProps[command.command]?.props,
    cx: command.points[0],
    cy: command.points[1], // Adjust for Circle
  };

  return (
    <GestureDetector gesture={panMarker}>
      <Shape {...shapePropsAdjusted} />
    </GestureDetector>
  );
};

const MyPathEditor = ({ pathData, keyProp }) => {
  const [commands, setCommands] = useState<
    { command: string; points: number[] }[]
  >([]);

  useEffect(() => {
    if (pathData.type === "d" && isValidPath(pathData.path)) {
      setCommands(getCommandsFromPath(pathData.path));
    } else {
      myConsole.log("Invalid path data - ", pathData.path);
    }
  }, [pathData]);

  const updatePath = useCallback((commands) => {
    const path = d3Path(); // Create a new instance of d3Path
    commands.forEach((command) => {
      if (command.command === "M") {
        path.moveTo(command.points[0], command.points[1]);
      } else if (command.command === "L") {
        path.lineTo(command.points[0], command.points[1]);
      } else if (command.command === "C") {
        path.bezierCurveTo(
          command.points[0],
          command.points[1],
          command.points[2],
          command.points[3],
          command.points[4],
          command.points[5],
        );
      }
      // Add other command types as needed
    });
    return path.toString();
  }, []);

	const updatedPath = useMemo(() => updatePath(commands), [commands]);

  const handleMove = (index) => (newPosition) => {
    const updatedCommands = [...commands];
    updatedCommands[index] = {
      ...updatedCommands[index],
      points: [
        newPosition.x,
        newPosition.y,
        ...updatedCommands[index].points.slice(2),
      ],
    };


    setCommands(updatedCommands);

    // console.log(updatedPath);
    if (isValidPath(updatedPath)) {
      // Update the pathData state
      const time = pathData.time;
      const length = pathData.length;
      const newLength = getPathLength(getPointsFromPath(updatedPath));
      const newTime = (newLength / length) * time;

      pathData.time = newTime;
      pathData.length = newLength;
      pathData.path = updatedPath;
    }
  };

  return (
    <React.Fragment key={`${keyProp}-${pathData.updatedAt}`}>
      {Brushes.find(
        (brush) => brush.params.guid === pathData.stroke.slice(5, -1),
      ) &&
        getBrush(
          Brushes.find(
            (brush) => brush.params.guid === pathData.stroke.slice(5, -1),
          )!,
        )}
      <Path
        d={pathData.path}
        stroke={pathData.stroke}
        strokeWidth={pathData.strokeWidth}
        strokeLinecap={pathData.strokeCap}
        strokeLinejoin={pathData.strokeJoin}
        opacity={pathData.strokeOpacity}
        fill={pathData.fill ?? "none"}
        strokeDasharray={pathData.strokeDasharray ?? undefined}
        strokeDashoffset={pathData.strokeDashoffset ?? undefined}
      />
      {commands.map((command, index) => (
        <DraggableMarker
          key={`marker-${index}`}
          command={command}
          onMove={handleMove(index)}
        />
      ))}
    </React.Fragment>
  );
};

export default MyPathEditor;
