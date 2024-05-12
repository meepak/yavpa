import { getSnappingPoint } from "@u/helper";
import { PathDataType, PointType } from "@u/types";

const snapPoints = (
  existingPaths: React.MutableRefObject<PathDataType[]>,
  canvasScale: number,
  canvasTranslate: PointType,
  pathPoints: PointType[]
) => {
  if (existingPaths.current.length > 0) {
    // revise first point
    const firstPoint = { ...pathPoints[0] }; // getFirstPoint(revisedCurrentPath.path);
    const revisedFirstPoint = getSnappingPoint(
      existingPaths.current,
      firstPoint,
      canvasScale,
      canvasTranslate,
    );

    console.log("snap analysis");
    let snapped = false;
    if (revisedFirstPoint !== false) {
      pathPoints[0] = revisedFirstPoint;
      // revisedCurrentPath.path = replaceFirstPoint(
      //   revisedCurrentPath.path,
      //   revisedFirstPoint,
      // );
      snapped = true;
      console.log("first point snapped");
    }

    const lastPoint = { ...pathPoints[pathPoints.length - 1] }; // { x: event.x, y: event.y };
    const revisedLastPoint = getSnappingPoint(
      existingPaths.current,
      lastPoint,
      canvasScale,
      canvasTranslate,
    );
    //replace last point in current path
    // since handle drawing point is not extending this point, lets do it here for now
    // this must be cleaned up later once it works as poc
    if (revisedLastPoint !== false) {
      pathPoints[pathPoints.length - 1] = revisedLastPoint;
      // revisedCurrentPath.path = replaceLastPoint(
      //   revisedCurrentPath.path,
      //   revisedLastPoint,
      // );
      snapped = true;
      console.log("last point snapped");
    }

    // if (snapped) {
    // return save ? saveCurrentPath(pathPoints): getCurrentPath(pathPoints);
    // }
    // return null;
  }
  return pathPoints;
};

export default snapPoints;
