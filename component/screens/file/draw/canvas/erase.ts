import * as turf from "@turf/turf";
import * as Crypto from "expo-crypto";
import {
  getPathFromPoints,
  getPathLength,
  getPointsFromPath,
  precise,
} from "@u/helper";

export const applyErasure = (erasurePathData, completedPathsData) => {
  const erasurePathPoints = getPointsFromPath(erasurePathData.path);
  ensurePolygonCloses(erasurePathPoints);

  if (erasurePathPoints.length < 4) {
    return completedPathsData; // Early return if not a valid polygon
  }

  const erasurePolygon = createPolygonFromPoints(erasurePathPoints);
  return processPaths(erasurePathData, completedPathsData, erasurePolygon);
};

function ensurePolygonCloses(points) {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (firstPoint.x !== lastPoint?.x || firstPoint.y !== lastPoint?.y) {
    points.push(firstPoint);
  }
}

function createPolygonFromPoints(points) {
  return turf.polygon([points.map((point) => [point.x, point.y])]);
}

function processPaths(erasurePathData, pathsData, erasurePolygon) {
  return pathsData
    .flatMap((pathData) => {
      if (pathData.path === "" || !pathData.visible) {
        return [];
      }

      const points = getPointsFromPath(pathData.path, 40, 0.01);
      const line = turf.lineString(points.map((point) => [point.x, point.y]));
      return splitAndFilterPath(pathData, line, erasurePolygon);
    })
    .filter((pathData) => pathData.path !== ""); // Remove empty paths
}

function splitAndFilterPath(pathData, line, erasurePolygon) {
  const split = turf.lineSplit(line, erasurePolygon);
  return split.features.flatMap((feature) =>
    reconstructPath(feature, pathData, erasurePolygon),
  );
}

function reconstructPath(feature, originalPathData, erasurePolygon) {
  const firstPoint = turf.point(feature.geometry.coordinates[0]);
  const inside = turf.booleanPointInPolygon(firstPoint, erasurePolygon);

  if (!inside) {
    const newPath = feature.geometry.coordinates.map((coord) => ({
      x: coord[0],
      y: coord[1],
    }));
    const length = getPathLength(newPath);
    const time = (length / originalPathData.length) * originalPathData.time;

    return [
      {
        ...originalPathData,
        path: getPathFromPoints(newPath),
        guid: Crypto.randomUUID(),
        length: precise(length),
        time: precise(time),
      },
    ];
  }
  return [];
}
