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
  return processPaths(completedPathsData, erasurePolygon);
};

function ensurePolygonCloses(points) {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  if (firstPoint?.x !== lastPoint?.x || firstPoint?.y !== lastPoint?.y) {
    points.push(firstPoint);
  }
}

function createPolygonFromPoints(points) {
  return turf.polygon([points.map((point) => [point.x, point.y])]);
}

function processPaths(pathsData, erasurePolygon) {
  return pathsData.flatMap((pathData) => {
    if (pathData.path === "" || !pathData.visible) {
      return [];
    }

    const points = getPointsFromPath(pathData.path);
    const line = turf.lineString(points.map((point) => [point.x, point.y]));
    const splits = turf.lineSplit(line, erasurePolygon);

    return filterSegments(splits, erasurePolygon, pathData);
  });
}

function filterSegments(splits, erasurePolygon, originalPathData) {
  return splits.features.flatMap((feature) => {
    // Check if any point of the segment is inside the polygon
    const segmentPoints = feature.geometry.coordinates;
    const segmentLine = turf.lineString(segmentPoints);
    const midpoint = turf.midpoint(
      turf.point(segmentPoints[0]),
      turf.point(segmentPoints[segmentPoints.length - 1]),
    );

    if (!turf.booleanPointInPolygon(midpoint, erasurePolygon)) {
      const newPath = segmentPoints.map((coord) => ({
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
  });
}
