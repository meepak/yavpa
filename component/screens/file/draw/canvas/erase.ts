import path from 'node:path';
import * as turf from '@turf/turf';
import * as Crypto from 'expo-crypto';
import {
	getPathFromPoints, getPathLength, getPointsFromPath, precise,
} from '../../../../../utilities/helper';
import {type PathDataType, type PointType} from '../../../../../utilities/types';

/**
* Apply erasure to the completed paths
* Go through each completed path
* For each path -
* 1. Go through each point of the path, check if it is inside the erasure path polygon
* 2. If it is inside, remove the point from the path else add it to new path
* 3. Check  next point, if it is inside, add current path to completed paths
* 4. If it is outside, continue to next point
**/
export const applyErasure = (erasurePathData: PathDataType, completedPathsData: PathDataType[]): PathDataType[] => {
	// MyConsole.log("Erasure path", erasurePathData.path);
	const erasurePathPoints = getPointsFromPath(erasurePathData.path);
	// Make sure first and last points are same
	if (erasurePathPoints.length > 1) {
		const firstPoint = erasurePathPoints[0];
		const lastPoint = erasurePathPoints.at(-1);
		if (firstPoint.x !== lastPoint?.x || firstPoint.y !== lastPoint?.y) {
			erasurePathPoints.push(firstPoint);
		}
	}

	if (erasurePathPoints.length < 4) {
		return completedPathsData;
	}

	/// ** increase resolution */

	// completed paths is within erasure points delete them
	// any completed paths within erasure paths is to be deleted

	for (const [index, pathData] of completedPathsData.entries()) {
		if (pathData.path === '' || !pathData.visible) {
			 null; continue;
		}

		// MyConsole.log("Checking Completed path", pathData.guid)
		// Create a path for each completed path
		const points = getPointsFromPath(pathData.path);

		// Convert path points to a Turf.js line string
		const line = turf.lineString(points.map(point => [point.x, point.y]));

		// Convert erasure polygon to a Turf.js polygon
		const erasurePolygon = turf.polygon([
			erasurePathPoints.map(point => [point.x, point.y]),
		]);

		// Split the line by the erasure polygon
		const split = turf.lineSplit(line, erasurePolygon);

		// Filter the split lines to only include lines outside the erasure polygon
		const outsideLines = split.features.filter(feature => {
			if (feature.geometry.coordinates.length < 2) {
				return null;
			}

			// Get the first point of the line
			const firstPoint = turf.point(feature.geometry.coordinates[0]);

			// Check if the first point is inside the erasure polygon
			const inside = turf.booleanPointInPolygon(firstPoint, erasurePolygon);

			if (!inside) {
				return feature;
			}
		});

		// Convert the split lines back to your point format
		const newPaths: PointType[][] = outsideLines.map(feature => {
			if (feature.geometry.coordinates && feature.geometry.coordinates.length > 1) {
				return feature.geometry.coordinates.map(coord => ({x: coord[0], y: coord[1]}));
			}

			return [];
		});

		// Check if the result is non-empty and replace in completedPathsData
		if (newPaths.length > 0) {
			// Insert newPaths in completedPathsData replacing a path at index
			completedPathsData.splice(index, 1,
				...newPaths.map(newPath => {
					const length = getPathLength(newPath);
					const time = (length / pathData.length) * pathData.time;
					// MyConsole.log("length", length, "time", time);
					return {
						...pathData,
						path: getPathFromPoints(newPath),
						guid: Crypto.randomUUID(),
						length: precise(length),
						time: precise(time),
					};
				}),
			);
		}
	}

	return completedPathsData.filter(pathData => {
		if (!pathData || pathData.path === '') {
			return false; // Remove it
		}

		const points = getPointsFromPath(pathData.path);
		const line = turf.lineString(points.map(point => [point.x, point.y]));
		const erasurePolygon = turf.polygon([erasurePathPoints.map(point => [point.x, point.y])]);

		// If the line is not contained within the erasure polygon, keep it
		if (!turf.booleanContains(erasurePolygon, line)) {
			return true;
		}

		// Otherwise, remove it
		return false;
	});
};
