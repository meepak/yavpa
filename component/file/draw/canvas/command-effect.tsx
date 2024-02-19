import { createPathdata } from "@u/helper";
import { PathDataType } from "@u/types";
import { SetStateAction, useEffect } from "react";

export const useCommandEffect = (
  command: string,
  editMode: boolean,
  initialPathData: PathDataType[],
  newPathData: { (): PathDataType; (): any; },
  completedPaths: PathDataType[],
  setCompletedPaths: { (value: SetStateAction<PathDataType[]>): void; },
  undonePaths: PathDataType[],
  setUndonePaths: { (value: SetStateAction<PathDataType[]>):  void; },
  setCurrentPath: { (value: SetStateAction<PathDataType>): void; },
  setCurrentShape: { (value: SetStateAction<{ name: string; start: { x: number; y: number; }; end: { x: number; y: number; }; }>): void; },
  forceUpdate: number
) => {
  useEffect(() => {
    // function body remains the same
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
      // case "select":
      //   setSelectMode(true);
      //   break;
      default: // check for shapes
        setCurrentShape({ name: command, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
        break;
    }
  }, [command, forceUpdate]);
};