import { getPathFromPoints, getPathLength, getPointsFromPath } from "@u/helper";
import {
  polygon,
  union,
  difference,
  intersect,
  booleanDisjoint,
} from "@turf/turf";

export const operation = (setMyPathData, myPathData, showToast, name: string) => {
  let operationFunction;
  switch (name) {
    case "union": {
      operationFunction = union;

      break;
    }

    case "intersect": {
      operationFunction = intersect;

      break;
    }

    case "difference": {
      operationFunction = difference;

      break;
    }

    default: {
      showToast("Operation not supported");
      return;
    }
  }

  const selectedPaths = myPathData.pathData.filter(
    (item) => item.selected === true,
  );
  if (selectedPaths.length !== 2) {
    showToast("Select two paths to perform intersection operation");
    return;
  }

  // Sort by updatedAt date
  selectedPaths.sort(
    (a, b) =>
      new Date(b.updatedAt as any).getTime() -
      new Date(a.updatedAt as any).getTime(),
  );
  const path1 = selectedPaths[1];
  const path2 = selectedPaths[0];

  const path1Points = getPointsFromPath(path1.path);

  // Check if first and last points are same
  if (
    path1Points[0].x !== path1Points.at(-1)?.x ||
    path1Points[0].y !== path1Points.at(-1)?.y
  ) {
    showToast("Path 1 is not closed");
    return;
  }

  const path2Points = getPointsFromPath(path2.path);
  if (
    path2Points[0].x !== path2Points.at(-1)?.x ||
    path2Points[0].y !== path2Points.at(-1)?.y
  ) {
    showToast("Path 2 is not closed");
    return;
  }

  const path1Polygon = polygon([
    path1Points.map((point) => [point.x, point.y]),
  ]);
  const path2Polygon = polygon([
    path2Points.map((point) => [point.x, point.y]),
  ]);

  if (!path1Polygon || !path2Polygon) {
    console.error("One or both of the polygons are undefined");
    return;
  }

  if (booleanDisjoint(path1Polygon, path2Polygon)) {
    showToast("Paths must intersect.");
    return;
  }

  const operated = operationFunction(path1Polygon, path2Polygon);
  const operatedPoints = operated?.geometry.coordinates[0].map((point) => ({
    x: point[0],
    y: point[1],
  }));

  if (!operatedPoints) {
    showToast(name + " operation failed");
    return;
  }

  const operatedPath = getPathFromPoints(operatedPoints);
  // Out of two selected paths, replace first one with unioned path and remove the second path
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.guid === path1.guid) {
        item.path = operatedPath;
        const length = getPathLength(operatedPoints);
        item.time = (item.time * length) / item.length;
        item.length = length;
        item.selected = true;
        item.updatedAt = new Date().toISOString();
      }
    }

    previous.pathData = previous.pathData.filter(
      (item) => item.guid !== path2.guid,
    );
    return {
      ...previous,
      metaData: { ...previous.metaData, updatedAt: "" },
      updatedAt: new Date().toISOString(),
    };
  });
  showToast(name + " operation performed");
};
