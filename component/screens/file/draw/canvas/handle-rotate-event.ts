import {type RotationGestureHandlerEventPayload, type GestureUpdateEvent} from 'react-native-gesture-handler';
import {type SetStateAction} from 'react';
import {type PathDataType, type PointType, type MyPathDataType} from '@u/types';
import {getPointsFromPath, getPathFromPoints, rotatePoints} from '@u/helper';
import * as Crypto from 'expo-crypto';

let startAngle = 0;

export const handleRotateEvent = (
	event: GestureUpdateEvent<RotationGestureHandlerEventPayload>,
	state: string,
	editMode: boolean,
	setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
	activeBoundaryBoxPath: PathDataType | undefined,
	setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | undefined>) => void,
	pivot: PointType,
) => {
	if (!activeBoundaryBoxPath || editMode) {
		return;
	}

	switch (state) {
		case 'began': {
			// Track starting angle
			startAngle = event.rotation;
			break;
		}

		case 'active': {
			// Calculate rotation angle
			const rotationAngle = event.rotation - startAngle;

			// Const pivot = {x: event.anchorX, y: event.anchorY};

			// rotate boundary box
			// const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
			// calculate center of the boundary box
			// const pivot = boundaryBoxPoints.reduce((acc, point) => {
			//     return {
			//         x: acc.x + point.x,
			//         y: acc.y + point.y,
			//     };
			// }, { x: 0, y: 0 });
			// const rotatedBoundaryBox = rotatePoints(boundaryBoxPoints, rotationAngle, pivot);
			// const rotatedBoundaryBoxPath = getPathFromPoints(rotatedBoundaryBox);

			// rotate selected paths
			setMyPathData(previous => {
				const points: Record<string, PointType[]> = {};

				for (const item of previous.pathData) {
					if (item.selected === true) {
						points[item.guid] = getPointsFromPath(item.path);
					}
				}

				for (const key of Object.keys(points)) {
					points[key] = rotatePoints(points[key], rotationAngle, pivot);
				}

				for (const item of previous.pathData) {
					if (points[item.guid]) {
						item.path = getPathFromPoints(points[item.guid]);
						item.updatedAt = new Date().toISOString();
					}
				}

				previous.updatedAt = new Date().toISOString();
				return previous;
			});

			// It seems change in myPathData is not causing re-rendering
			// may be its bit more complex object, but change in boundary box causes re-rendering
			// so we are updating boundary box updated field only without updating actual path data
			setActiveBoundaryBoxPath({
				...activeBoundaryBoxPath,
				visible: false,
				updatedAt: new Date().toISOString(),
			});

			// Update starting angle for the next frame
			startAngle = event.rotation;
			break;
		}

		case 'ended': {
			startAngle = 0;
			setMyPathData(previous => {
				previous.metaData.updatedAt = '';
				return previous;
			});
			setActiveBoundaryBoxPath({
				...activeBoundaryBoxPath,
				visible: true,
				updatedAt: new Date().toISOString(),
			});
			break;
		}
	}
};
