import { SetStateAction } from "react";
import {
  calculateDistance,
  get5PointsFromPath,
  getPathFromPoints,
  getPathLength,
  getPointsFromPath,
} from "@u/helper";
import { PathDataType, PointType, SNAPPING_TOLERANCE } from "@u/types";

// TODO use pathPoints..
const detectParallel = (
  currentPath: PathDataType,
  setCurrentPath: (value: SetStateAction<PathDataType>) => void,
  existingPaths: React.MutableRefObject<PathDataType[]>,
  canvasScale: number,
):PointType[]|undefined => {
  const current5Points = get5PointsFromPath(currentPath.path);
  //   console.log(current5Points, 'current5Points')
  const currentPath5PointsLength = getPathLength(current5Points);

  // Now re-asses the whole path, is there a line parallel to this  path within tolerance based on its starting and end point
  // parallel could be  straight line or curved line
  // if yes, then replace the path with this parallel path

  const snappingTolerance = SNAPPING_TOLERANCE * canvasScale;
  existingPaths.current.forEach((path) => {
    // with each path, check if there length is within tolerance matches,
    // if so --lets check 4 points with current path
    // start point, end point and 2 points in between
    // if the distances are within tolerance, then we have a parallel path
    // we will just replicate the same path  this starting and end point

    const path5Points = get5PointsFromPath(path.path);
    const path5PointsLength = getPathLength(path5Points);

    if (
      Math.abs(currentPath5PointsLength - path5PointsLength) > snappingTolerance
    ) {
      return;
    }
    // lets check the distance between 5 points
    // first distance
    let distance = calculateDistance(current5Points[0], path5Points[0]);
    if (distance > snappingTolerance) {
      return;
    }
    // second distance
    distance = calculateDistance(current5Points[1], path5Points[1]);
    if (distance > snappingTolerance) {
      return;
    }
    // third distance
    distance = calculateDistance(current5Points[2], path5Points[2]);
    if (distance > snappingTolerance) {
      return;
    }
    // fourth distance
    distance = calculateDistance(current5Points[3], path5Points[3]);
    if (distance > snappingTolerance) {
      return;
    }
    // fifth distance
    distance = calculateDistance(current5Points[4], path5Points[4]);
    if (distance > snappingTolerance) {
      return;
    }
    // we found the match
    // lets translate this path to current paths position
    // replace first and last point, and adjust the inbetween points accordingly
    // now we must use getPointsFromPath to get the points from path
    const pathPoints = getPointsFromPath(path.path);
    const firstPoint = pathPoints[0];
    const lastPoint = pathPoints[pathPoints.length - 1];
    const dx = current5Points[0].x - firstPoint.x;
    const dy = current5Points[0].y - firstPoint.y;
    const newPoints = pathPoints.map((point) => {
      return {
        x: point.x + dx,
        y: point.y + dy,
      };
    });
    // does last point match? if not readjust from last point
    const lastPointDistance = calculateDistance(lastPoint, current5Points[4]);
    if (lastPointDistance > snappingTolerance) {
      const dx = current5Points[4].x - lastPoint.x;
      const dy = current5Points[4].y - lastPoint.y;
      newPoints.forEach((point) => {
        point.x += dx;
        point.y += dy;
      });
    }
    // make sure first and last point exactly matches so replace them with our ones
    newPoints[0] = current5Points[0];
    newPoints[newPoints.length - 1] = current5Points[4];

    console.log("we are replacing the line with parallel one..");
    // now convert this path to string
    const newPath = getPathFromPoints(newPoints);
    currentPath.path = newPath;
    setCurrentPath({
      ...currentPath,
      path: newPath,
    });
    return newPoints;
    // This should make parallel straight line or curved line, finger crossed
  });

  return;
};

export default detectParallel;
