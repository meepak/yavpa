import myConsole from "@c/my-console-log";
import { createPathdata, createMyPathData } from "@u/helper";
import { PathDataType, ShapeType, MyPathDataType } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import { SetStateAction, useContext, useEffect } from "react";

export const useCommandEffect = (
  command: string,
  editMode: boolean,
  // initialPathData: PathDataType[],
  newPathData: { (): PathDataType; (): any; },
  myPathData: MyPathDataType,
  setMyPathData: { (value: SetStateAction<MyPathDataType>): void; },
  undonePaths: PathDataType[],
  setUndonePaths: { (value: SetStateAction<PathDataType[]>): void; },
  setCurrentPath: { (value: SetStateAction<PathDataType>): void; },
  setCurrentShape: { (value: SetStateAction<ShapeType>): void; },
  forceUpdate: number
) => {
  useEffect(() => {
    // function body remains the same
    if (!editMode) return;
    switch (command) {
      case "open":
      case "update": // TODO this command shouldn't be necessary..
        // setCompletedPaths(() => initialPathData);
        setCurrentPath(() => newPathData()); //should we use newPathData instead?? ??
        // setUndonePaths(() => []);
        break;
      case "reset":
        // setCompletedPaths(() => []);
        setMyPathData(createMyPathData());
        setCurrentPath(() => createPathdata()); //should we use newPathData instead?? NOPE
        setUndonePaths(() => []);
        break;
      case "undo":
        if (myPathData.pathData.length > 0) {
          setUndonePaths((prevUndonePaths) => [
            ...prevUndonePaths,
            myPathData.pathData[myPathData.pathData.length - 1],
          ]);
          setMyPathData((prev) => ({
            ...prev,
            metaData: { ...prev.metaData, updatedAt: "" },
            pathData: prev.pathData.slice(0, -1)
          }));
          myConsole.log(undonePaths.length)
        }
        break;
      case "redo":
        myConsole.log("redooo")
        if (undonePaths.length > 0) {
          myConsole.log("redooo inside")
          setMyPathData((prev) => ({
            ...prev,
            metaData: { ...prev.metaData, updatedAt: "" },
            pathData: [...prev.pathData, undonePaths[undonePaths.length - 1]],
          }));
          setUndonePaths((prevUndonePaths) => prevUndonePaths.slice(0, -1));
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