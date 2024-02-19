import { getPathFromPoints, getPointsFromPath, precise } from './helper';
import { PathDataType, PointType } from './types';
import * as turf from '@turf/turf';
import { polygonLength } from 'd3-polygon';
import * as Crypto from "expo-crypto";


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
    // console.log("Erasure path", erasurePathData.path);
    const erasurePathPoints = getPointsFromPath(erasurePathData.path);
    // make sure first and last points are same
    if (erasurePathPoints.length > 1) {
        const firstPoint = erasurePathPoints[0];
        const lastPoint = erasurePathPoints[erasurePathPoints.length - 1];
        if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
            erasurePathPoints.push(firstPoint);
        }
    }
    if(erasurePathPoints.length < 4) {
        return completedPathsData;
    }

    completedPathsData.forEach((pathData, index) => {
        if(pathData.path === "" || !pathData.visible) {
            return null;
        }
        // console.log("Checking Completed path", pathData.guid)
        // Create a path for each completed path
        let points = getPointsFromPath(pathData.path);

        // Convert your points to a Turf.js line string
        let line = turf.lineString(points.map(point => [point.x, point.y]));

        // Convert your erasure polygon to a Turf.js polygon
        let erasurePolygon = turf.polygon([
            erasurePathPoints.map((point) => [point.x, point.y])
        ]);

        // Split the line by the erasure polygon
        let split = turf.lineSplit(line, erasurePolygon);

        // Filter the split lines to only include lines outside the erasure polygon
        let outsideLines = split.features.filter(feature => {

            if(feature.geometry.coordinates.length < 2) {
                return null;
            }
            // Get the first point of the line
            let firstPoint = turf.point(feature.geometry.coordinates[0]);

            // Check if the first point is inside the erasure polygon
            let inside = turf.booleanPointInPolygon(firstPoint, erasurePolygon);

            if(!inside) {
                return feature;
            }
        });

        // Convert the split lines back to your point format
        let newPaths: PointType[][] = outsideLines.map(feature => {
            if (feature.geometry.coordinates && feature.geometry.coordinates.length > 1) {
                return feature.geometry.coordinates.map(coord => {
                    return { x: coord[0], y: coord[1] };
                });
            }
            return [];
        });

        // Check if the result is non-empty and replace in completedPathsData
        if (newPaths.length > 0) {
            // insert newPaths in completedPathsData replacing a path at index
            completedPathsData.splice(index, 1,
                ...newPaths.map((newPath) => {
                    const length = polygonLength(newPath.map(point => [point.x, point.y]));
                    const time = (length / pathData.length) * pathData.time;
                    console.log("length", length, "time", time);
                    return {
                        ...pathData,
                        path: getPathFromPoints(newPath),
                        guid: Crypto.randomUUID(),
                        length: precise(length, 5),
                        time: precise(time, 5),
                    };
                })
            );
        }
    });

    return completedPathsData;
}