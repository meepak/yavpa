import { SetStateAction } from "react";
import {
  createPathdata,
  getPathFromPoints,
  getPathLength,
  getPointsFromPath,
  isValidPath,
} from "@u/helper";
import { MyPathDataType, PathDataType, PointType } from "@u/types";
import { randomUUID } from "expo-crypto";

const presentPath = (
  currentPath: PathDataType,
  setCurrentPath: (value: SetStateAction<PathDataType>) => void,
) => {
  const set = (currentPathPoints?: PointType[]) => {
    if (currentPathPoints) {
      currentPath.path = getPathFromPoints(currentPathPoints);
      currentPath.length = getPathLength(currentPathPoints);
    }
    if (isValidPath(currentPath.path)) {
      currentPath.visible = true;
      currentPath.selected = false;
      if (!currentPathPoints) {
        // TODO:: IS THIS NECESSARY???
        currentPathPoints = getPointsFromPath(currentPath.path);
        currentPath.length = getPathLength(currentPathPoints);
      }
    }
    setCurrentPath(currentPath);
    return presentPath(currentPath, setCurrentPath);
  };

  //Save current path to state and reset current path
  const save = (
    setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
    currentPathPoints?: PointType[],
  ) => {
    set(currentPathPoints);
    setMyPathData((previous: MyPathDataType) => ({
      ...previous,
      metaData: { ...previous.metaData, updatedAt: "" },
      pathData: [...previous.pathData, { ...currentPath, guid: randomUUID() }],
    }));
    return presentPath(currentPath, setCurrentPath);
  };

  const reset = () => {
    setCurrentPath({
      ...createPathdata(),
      time: 0,
    });
    return presentPath(currentPath, setCurrentPath);
  };

  return { set, save, reset };
};

export default presentPath;
