import {type PinchGestureHandlerEventPayload, type GestureUpdateEvent} from 'react-native-gesture-handler';
import {type SetStateAction} from 'react';
import {type PathDataType, type PointType, type MyPathDataType} from '@u/types';
import {
	getPointsFromPath, getPathFromPoints, scalePoints, getPathLength,
} from '@u/helper';
import * as Crypto from 'expo-crypto';
import myConsole from '@c/controls/pure/my-console-log';

let startScale = 1;

export const handleScaleEvent = (
	event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
	state: string,
	editMode: boolean,
	setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
	activeBoundaryBoxPath: PathDataType | undefined,
	setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | undefined>) => void,
	scaleMode: 'X' | 'Y' | 'XY',
	setScaleMode: (value: SetStateAction<'X' | 'Y' | 'XY'>) => void,
	focalPoint: PointType,
) => {
	if (!activeBoundaryBoxPath || editMode) {
		return;
	}

	switch (state) {
		case 'began': {
			// Track starting scale
			startScale = event.scale;
			break;
		}

		case 'active': {
			// Calculate scale factor
			const scaleFactor = event.scale / startScale;
			const scaleFactorX = scaleMode === 'X' || scaleMode === 'XY' ? scaleFactor : 1;
			const scaleFactorY = scaleMode === 'Y' || scaleMode === 'XY' ? scaleFactor : 1;

			// Scale boundary box
			// const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
			// const scaledBoundaryBox = scalePoints(boundaryBoxPoints, scaleFactorX, scaleFactorY, focalPoint);
			// const scaledBoundaryBoxPath = getPathFromPoints(scaledBoundaryBox);

			// scale selected paths
			setMyPathData(previous => {
				for (const item of previous.pathData) {
					if (item.selected === true) {
						const points = getPointsFromPath(item.path);
						const scaledPoints = scalePoints(points, scaleFactorX, scaleFactorY, focalPoint);
						item.path = getPathFromPoints(scaledPoints);

						// We need original value to prevent this from going to 1 and equalizing with everyhting else
						item.strokeWidth *= scaleFactor;

						item.updatedAt = new Date().toISOString();
					}
				}

				return previous;
			});

			setActiveBoundaryBoxPath({
				...activeBoundaryBoxPath,
				visible: false,
				updatedAt: new Date().toISOString(),
				// Path: scaledBoundaryBoxPath,
			});

			// Update starting scale for the next frame
			startScale = event.scale;
			break;
		}

		case 'ended': {
			myConsole.log('scale ended');
			setMyPathData(previous => {
				const points: Record<string, PointType[]> = {};

				for (const item of previous.pathData) {
					if (item.selected === true) {
						points[item.guid] = getPointsFromPath(item.path);
					}
				}

				for (const key of Object.keys(points)) {
					const newLength = getPathLength(points[key]);
					const item = previous.pathData.find(item => item.guid === key);
					if (item) {
						item.time = item.time * newLength / item.length;
						item.length = newLength;
						item.updatedAt = new Date().toISOString();
					}
				}

				previous.metaData.updatedAt = '';
				return previous;
			});
			startScale = 1;
			setScaleMode('XY');
			break;
		}
	}
};
