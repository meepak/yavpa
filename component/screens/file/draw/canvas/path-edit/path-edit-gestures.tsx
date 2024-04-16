
import {
	type SetStateAction, useContext, useEffect, useRef, useState,
} from 'react';
import {
	Gesture,
	GestureDetector,
	GestureUpdateEvent,
	PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
	type PathDataType,
	type MetaDataType,
	type MyPathDataType,
	type PointType,
	I_AM_IOS,
	I_AM_ANDROID,
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	SNAPPING_TOLERANCE,
	CANVAS_WIDTH,
	PathPointType,
} from '@u/types';
import {debounce} from 'lodash';
import * as D3Path from 'd3-path';

type PathEditGesturesProperties = {
	myPathData: {pathData: PathDataType[]; metaData: MetaDataType};
	setMyPathData: (value: SetStateAction<MyPathDataType>) => void;
	pathEditMode: boolean;
	setPathEditMode: (value: SetStateAction<boolean>) => void;
	currentPath: PathDataType;
	setCurrentPath: (value: SetStateAction<PathDataType>) => void;
	startTime: number;
	setStartTime: (value: SetStateAction<number>) => void;
	newPathData: () => PathDataType;
	canvasScale: number;
	setCanvasScale: (value: SetStateAction<number>) => void;
	canvasTranslate: PointType;
	setCanvasTranslate: (value: SetStateAction<PointType>) => void;
	penTip: PointType | undefined;
	setPenTip: (value: SetStateAction<PointType | undefined>) => void;
	editedPath: typeof D3Path | undefined;
	setEditedPath: (value: SetStateAction<typeof D3Path | undefined>) => void;
	currentPathPointType: React.MutableRefObject<PathPointType>;
	setPathEditPoints: (value: SetStateAction<Array<{point: PointType; type: PathPointType}>>) => void;
	children: React.ReactNode;
};

export const PathEditGestures = ({
	myPathData,
	setMyPathData,
	pathEditMode,
	setPathEditMode,
	currentPath,
	setCurrentPath,
	startTime,
	setStartTime,
	newPathData,
	canvasScale,
	setCanvasScale,
	canvasTranslate,
	setCanvasTranslate,
	penTip,
	setPenTip,
	editedPath,
	setEditedPath,
	currentPathPointType,
	setPathEditPoints,
	children,
}: PathEditGesturesProperties): React.ReactNode => {
	const pathPointsReference = useRef<Array<{point: PointType; type: PathPointType}>>([]);
	const previousPointReference = useRef<PointType>();
	const editedPathReference = useRef<typeof D3Path>();
	const penTipReference = useRef<PointType>({
		x: CANVAS_WIDTH / 2 * canvasScale + canvasTranslate.x,
		y: CANVAS_WIDTH / 2 * canvasScale + canvasTranslate.y,
	});

	/**
     *
     * MoveTo(x, y): Moves the pen to the specified point (x, y) without drawing anything.
     * lineTo(x, y): Draws a line from the current pen position to the point (x, y).
     * quadraticCurveTo(x1, y1, x, y): Draws a quadratic Bézier curve from the current pen position to the point (x, y) using (x1, y1) as the control point.
     * bezierCurveTo(x1, y1, x2, y2, x, y): Draws a cubic Bézier curve from the current pen position to the point (x, y) using (x1, y1) and (x2, y2) as the control points.
     * arcTo(x1, y1, x2, y2, r): Draws an arc from the current pen position to the point (x2, y2) with radius r that tangentially intersects the line segment from the current pen position to (x1, y1).
     * arc(x, y, r, a0, a1, ccw): Draws an arc of radius r centered at (x, y) from angle a0 to a1. If ccw is true, the arc is drawn counterclockwise; otherwise, it is drawn clockwise.
     * rect(x, y, w, h): Draws a rectangle with the top-left corner at (x, y) and with width w and height h.
     * closePath(): Draws a line from the current pen position to the start of the current subpath.

     */
	// --------------------------------------

	// double tap to start a path, end the path
	const doubleTapSelectGesture = Gesture.Tap();
	doubleTapSelectGesture.numberOfTaps(2).onEnd(event => {
		const tapPoint = {
			x: event.x * canvasScale + canvasTranslate.x,
			y: event.y * canvasScale + canvasTranslate.y,
		};
		if (!editedPath) {
			editedPathReference.current = D3Path.path();
			editedPathReference.current.moveTo(tapPoint.x, tapPoint.y);
			previousPointReference.current = tapPoint;
			pathPointsReference.current.push({point: tapPoint, type: PathPointType.MoveTo});
			setEditedPath(editedPathReference.current);
			setPathEditPoints(pathPointsReference.current);
		}
	});

	// Tap to add point of different types of points
	const tapSelectGesture = Gesture.Tap();
	tapSelectGesture.numberOfTaps(1).onEnd(event => {
		if (editedPath.points.length === 0) {
			return;
		}

		const tapPoint = {
			x: event.x * canvasScale + canvasTranslate.x,
			y: event.y * canvasScale + canvasTranslate.y,
		};

		switch (currentPathPointType.current) {
			case PathPointType.MoveTo: {
				editedPathReference.current.moveTo(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.LineTo: {
				editedPathReference.current.lineTo(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.QuadraticCurveTo: {
				const controlPoint = {
					x: (previousPointReference?.current?.x || 0 + tapPoint.x) / 2,
					y: (previousPointReference?.current?.y || 0 + tapPoint.y) / 2,
				};
				editedPathReference.current.quadraticCurveTo(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.BezierCurveTo: {
				const controlPoint1 = {
					x: (previousPointReference?.current?.x || 0 + tapPoint.x) / 3,
					y: (previousPointReference?.current?.y || 0 + tapPoint.y) / 3,
				};
				const controlPoint2 = {
					x: (previousPointReference?.current?.x || 0 + 2 * tapPoint.x) / 3,
					y: (previousPointReference?.current?.y || 0 + 2 * tapPoint.y) / 3,
				};
				editedPathReference.current.bezierCurveTo(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.ArcTo: {
				editedPathReference.current.arcTo(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.Arc: {
				editedPathReference.current.arc(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.Rect: {
				editedPathReference.current.rect(tapPoint.x, tapPoint.y);
				break;
			}

			case PathPointType.ClosePath: {
				editedPathReference.current.closePath();
				break;
			}
		}

		previousPointReference.current = tapPoint;
		pathPointsReference.current.push({point: tapPoint, type: PathPointType.MoveTo});
		setPathEditPoints(pathPointsReference.current);
	});

	//--------------------------------------

	// For moving paths on screen
	const panDragEvent = debounce((event, state) => {
		const panTranslatePoint = {
			x: event.translationX * canvasScale,
			y: event.translationY * canvasScale,
		};

		// If control points or marker selected, move that along with pentip
		penTipReference.current.x = panTranslatePoint.x;
		penTipReference.current.y = panTranslatePoint.y;
		setPenTip({x: panTranslatePoint.x, y: panTranslatePoint.y});
	}, 5, {leading: I_AM_ANDROID, trailing: I_AM_IOS});

	const panDragGesture = Gesture.Pan();
	panDragGesture.shouldCancelWhenOutside(false);
	panDragGesture.minPointers(1);
	panDragGesture.maxPointers(1);
	panDragGesture.onBegin(event => {
		// Console.log('panDrag began');
		panDragEvent.cancel();
		panDragEvent(event, 'began');
	});
	panDragGesture.onUpdate(event => panDragEvent(event, 'active'));
	panDragGesture.onEnd(event => {
		panDragEvent.flush();
		panDragEvent(event, 'ended');
	});

	useEffect(() => {
		panDragGesture.enabled(pathEditMode);
		tapSelectGesture.enabled(pathEditMode);
		doubleTapSelectGesture.enabled(pathEditMode);
		if (!pathEditMode) {
			setEditedPath(previous => ({
				...previous,
				path: '',
				points: [],
			}));
		}
	}, [pathEditMode]);

	// Combine all gestures and initialize
	// const composedPanTap = Gesture.Simultaneous(doubleTapSelectGesture);
	const composedSelect = Gesture.Exclusive(doubleTapSelectGesture, tapSelectGesture);
	const composedGesture = Gesture.Race(panDragGesture, composedSelect);
	composedGesture.initialize();

	return (
		<GestureDetector gesture={composedGesture}>
			{children}
		</GestureDetector>
	);
};
