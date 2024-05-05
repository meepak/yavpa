import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Circle, Path, Rect, G } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { path as d3Path } from "d3-path";
import { getCommandsFromPath, getPathLength, isValidPath } from "@u/helper";
import myConsole from "./my-console-log";
import MyPath from "./my-path";

const DraggableMarker = ({ command, onMove }) => {
  const position = useSharedValue({
    x: command.points[0],
    y: command.points[1],
  });
  const lastGesturePosition = useRef({ x: 0, y: 0 });

 const panMarker = Gesture.Pan()
   .onStart(() => {
     lastGesturePosition.current = { x: 0, y: 0 };
   })
   .onUpdate((event) => {
     "worklet";
     const deltaX = event.translationX - lastGesturePosition.current.x;
     const deltaY = event.translationY - lastGesturePosition.current.y;
     const newX = position.value.x + deltaX;
     const newY = position.value.y + deltaY;
     position.value.x = newX;
     position.value.y = newY;
     runOnJS(onMove)({ x: newX, y: newY });
     lastGesturePosition.current = {
       x: event.translationX,
       y: event.translationY,
     };
   });

  const shapeProps = {
    M: {
      component: Rect,
      props: {
        fill: "green",
        x: position.value.x - 10,
        y: position.value.y - 10,
        width: 20,
        height: 20,
      },
    },
    L: {
      component: Rect,
      props: {
        fill: "blue",
        x: position.value.x - 10,
        y: position.value.y - 10,
        width: 20,
        height: 20,
      },
    },
    C: {
      component: Circle,
      props: {
        fill: "yellow",
        cx: position.value.x,
        cy: position.value.y,
        r: 10,
      }, // <-- Fixed line
    },
  };

  const Shape = shapeProps[command.command]?.component || Circle;
  const shapePropsAdjusted = shapeProps[command.command]?.props;

  return (
    <GestureDetector gesture={panMarker}>
      <Shape {...shapePropsAdjusted} />
    </GestureDetector>
  );
};

const MyPathEditor = ({ pathData, keyProp }) => {
  const commands = useRef<{ command: string; points: number[] }[]>(
    getCommandsFromPath(pathData),
  );
  const [updatedPathData, setUpdatedPathData] = useState(pathData);

  const updatePath = useCallback(() => {
    const path = d3Path();
    commands.current?.forEach((command) => {
      // Handling different types of commands
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
    });
    return path.toString();
  }, []);

  const handleMove = useCallback((newPosition, index) => {
    const command = commands.current[index];
    let newPoints;
    if (command.command === "C") {
      // If it's a 'C' command, keep the existing control points and update the endpoint
      newPoints = [
        command.points[0],
        command.points[1],
        command.points[2],
        command.points[3],
        newPosition.x,
        newPosition.y,
      ];
    } else {
      // For 'M' and 'L' commands, just update the point
      newPoints = [newPosition.x, newPosition.y];
    }
    commands.current[index] = {
      ...command,
      points: newPoints,
    };
    const newPath = updatePath();
    setUpdatedPathData((prev) => ({
      ...prev,
      path: newPath,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return (
    <React.Fragment key={`${keyProp}-${updatedPathData?.updatedAt}`}>
      <MyPath prop={updatedPathData} keyProp={keyProp} />
      <G>
        {commands.current.map((command, index) => (
          <DraggableMarker
            key={`marker-${index}`}
            command={command}
            onMove={(newPosition: any) => handleMove(newPosition, index)}
            // onEnd={handleEnd}
          />
        ))}
      </G>
    </React.Fragment>
  );
};

export default MyPathEditor;
