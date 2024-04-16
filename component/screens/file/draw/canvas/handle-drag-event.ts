
import {getPathFromPoints, getPointsFromPath} from '@u/helper';
import {GestureUpdateEvent, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {type SetStateAction, useCallback} from 'react';
import {type PathDataType, type PointType, type MyPathDataType} from '@u/types';
import myConsole from '@c/my-console-log';

const startPoint = {
	x: 0,
	y: 0,
};
export const handleDragEvent = (
	panTranslatePoint: PointType,
	state: string,
	editMode: boolean,
	setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
	activeBoundaryBoxPath: PathDataType | undefined,
	setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | undefined>) => void,
) => {
	if (!activeBoundaryBoxPath || editMode) {
		return;
	}

	switch (state) {
		case 'began': {
			// MyConsole.log("start pan began in", Platform.OS);
			// track starting point
			startPoint.x = panTranslatePoint.x;
			startPoint.y = panTranslatePoint.y;
			break;
		}

		case 'active': {
			// MyConsole.log("select pan active in", Platform.OS);
			// track how x offset and y offset
			// apply to selected paths and boudary box
			const xOffset = panTranslatePoint.x - startPoint.x;
			const yOffset = panTranslatePoint.y - startPoint.y;

			// Update starting point for the next frame
			startPoint.x = panTranslatePoint.x;
			startPoint.y = panTranslatePoint.y;

			// Const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
			// const movedBoundaryBox = boundaryBoxPoints.map((point) => {
			//   return {
			//     x: point.x + xOffset,
			//     y: point.y + yOffset,
			//   };
			// });
			// const movedBoundaryBoxPath = getPathFromPoints(movedBoundaryBox);
			// move selected paths

			setMyPathData(previous => {
				const points: Record<string, PointType[]> = {};

				for (const item of previous.pathData) {
					if (item.selected === true) {
						points[item.guid] = getPointsFromPath(item.path);
					}
				}

				for (const key of Object.keys(points)) {
					points[key] = points[key].map(p => ({
						x: p.x + xOffset,
						y: p.y + yOffset,
					}));
				}

				for (const item of previous.pathData) {
					if (points[item.guid]) {
						item.path = getPathFromPoints(points[item.guid]);
						item.updatedAt = new Date().toISOString();
					}
				}

				return previous;
			});

			// For sake of rerendering
			setActiveBoundaryBoxPath({
				...activeBoundaryBoxPath,
				visible: false,
				updatedAt: new Date().toISOString(),
			});

			break;
		}

		case 'ended': {
			// Reset startPoint
			startPoint.x = 0;
			startPoint.y = 0;
			myConsole.log('select ended');
			setMyPathData(previous => {
				previous.metaData.updatedAt = '';
				return previous;
			});

			break;
		}
	}
};
