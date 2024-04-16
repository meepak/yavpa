
import {
	type SetStateAction, useContext, useEffect, useRef, useState,
} from 'react';
import {
	Gesture,
	GestureDetector,
	type GestureUpdateEvent,
	type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
	type PathDataType,
	type MetaDataType,
	type MyPathDataType,
	type ShapeType,
	type PointType,
	I_AM_IOS,
	I_AM_ANDROID,
	SCREEN_WIDTH,
	SCREEN_HEIGHT,
	SNAPPING_TOLERANCE,
	CANVAS_WIDTH,
} from '@u/types';
import {debounce} from 'lodash';
import {getBoundaryBox} from '@c/my-boundary-box-paths';
import {UserPreferencesContext} from '@x/user-preferences';
import {
	get5PointsFromPath,
	calculateDistance,
	getPathLength,
	getPenOffsetFactor,
	getPointsFromPath,
	getSnappingPoint,
	precise,
	replaceLastPoint,
	isLineMeantToBeStraight,
	getPathFromPoints,
} from '@u/helper';
import {shapeData} from '@u/shapes';
import createShapeIt from '../../../../../lib/shapeit';
import {handleDrawingEvent} from './handle-drawing-event';
import {handleSelectEvent} from './handle-select-event';
import {handleDragEvent} from './handle-drag-event';
import {handleScaleEvent} from './handle-scale-event';
import {handleRotateEvent} from './handle-rotate-event';

type MyGesturesProperties = {
	myPathData: {pathData: PathDataType[]; metaData: MetaDataType};
	setMyPathData: (value: SetStateAction<MyPathDataType>) => void;
	editMode: boolean;
	enhancedDrawingMode: boolean;
	erasureMode: boolean;
	currentPath: PathDataType;
	setCurrentPath: (value: SetStateAction<PathDataType>) => void;
	startTime: number;
	setStartTime: (value: SetStateAction<number>) => void;
	newPathData: () => PathDataType;
	currentShape: ShapeType;
	setCurrentShape: (value: SetStateAction<ShapeType>) => void;
	simplifyTolerance: number;
	d3CurveBasis: string;
	activeBoundaryBoxPath: PathDataType | undefined;
	setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | undefined>) => void;
	scaleMode: 'X' | 'Y' | 'XY';
	setScaleMode: (value: SetStateAction<'X' | 'Y' | 'XY'>) => void;
	canvasScale: number;
	setCanvasScale: (value: SetStateAction<number>) => void;
	canvasTranslate: PointType;
	setCanvasTranslate: (value: SetStateAction<PointType>) => void;
	penTipRef: React.MutableRefObject<PointType>;
	children: React.ReactNode;
};

export const MyGestures = ({
	myPathData,
	setMyPathData,
	editMode,
	enhancedDrawingMode,
	erasureMode,
	currentPath,
	setCurrentPath,
	startTime,
	setStartTime,
	newPathData,
	currentShape,
	setCurrentShape,
	simplifyTolerance,
	d3CurveBasis,
	activeBoundaryBoxPath,
	setActiveBoundaryBoxPath,
	scaleMode,
	setScaleMode,
	canvasScale,
	setCanvasScale,
	canvasTranslate,
	setCanvasTranslate,
	penTipRef,
	children,
}: MyGesturesProperties): React.ReactNode => {
	if (!myPathData) {
		return null;
	} // Seems unnecessary

	// const snappingTolerance = SNAPPING_TOLERANCE * canvasScale; // TODO ADJUST TOLERANCE AS PER CURRENT ZOOM LEVEL
	const {penOffset} = useContext(UserPreferencesContext);
	const penOffsetReference = useRef({x: 0, y: 0});

	const existingPaths = useRef<PathDataType[]>([]);

	useEffect(() => {
		existingPaths.current = (myPathData.pathData.filter(path => path.visible));
		existingPaths.current.sort(
			(a, b) =>
				new Date(b.updatedAt as any).getTime()
        - new Date(a.updatedAt as any).getTime(),
		);
	}, [myPathData]);

	// For all things related to drawing a path
	const handlePanDrawingEvent = async (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
		if (state === 'began') { // Need to measure at begining of each writing event
			const pp = await getPenOffsetFactor();

			penOffsetReference.current.x = (pp?.x || 0) * penOffset.x;
			penOffsetReference.current.y = (pp?.y || 0) * penOffset.y;


		}
		// MyConsole.log('penOffset', penOffsetRef.current);

		// const svgPoint = getSvgPoint(event.x / SCREEN_WIDTH, event.y / SCREEN_HEIGHT, canvasScale, canvasTranslate.x, canvasTranslate.y);

			penTipRef.current = {
				x: (event.x * canvasScale + penOffsetReference.current.x + canvasTranslate.x), // * SCREEN_WIDTH,
				y: (event.y * canvasScale + penOffsetReference.current.y + canvasTranslate.y), // * SCREEN_HEIGHT,
		}

		console.log("ACTIVE penTipRef.current", penTipRef.current);
		// PenTipRef.current = { ...penTip as any};

		handleDrawingEvent(
			penTipRef,
			event,
			state,
			myPathData,
			setMyPathData,
			editMode,
			erasureMode,
			currentPath,
			setCurrentPath,
			startTime,
			setStartTime,
			newPathData,
			currentShape,
			setCurrentShape,
			simplifyTolerance,
			d3CurveBasis,
		);

		if (state === 'ended') {
			// PenTipRef.current = null;
			penOffsetReference.current.x = 0;
			penOffsetReference.current.y = 0;
			// TODO, this has no business cluttering my-gesture, should be part of handle drawing event
			// re-assess the  current path, snap the end point to  the nearest point
			// DONE snap starting point with nearest free point or cornor point within fingertip size tolerance
			// Convert path to straight line, circle,  curve cornor or sharp cornor based on tolerance
			// maintain parallel line for straight line or curves if profile fit so  with nerby path
			// DONE snap end point with nearest free point or cornor point within fingertip size tolerance

	// 		if (enhancedDrawingMode) {
	// 			const pathPoints = getPointsFromPath(currentPath.path);
	// 			// Console.log(pathPoints);
	// 			const d3Points = pathPoints.map(point => [point.x, point.y]);
	// 			// Console.log(d3Points);
	// 			const shape = createShapeIt(d3Points);

	// 			let path = '';
	// 			switch (shape.name) {
	// 				case 'circle': {
	// 					// G  {"center": [222.486367154066, 299.6396762931909], "name": "circle", "radius": 22.522530924163494}
	// 					const center = shape.center;
	// 					const radius = shape.radius;
	// 					// Calculate two opposite point on circle
	// 					const startPoint = {
	// 						x: center[0] - radius / 2,
	// 						y: center[1],
	// 					};
	// 					const endPoint = {
	// 						x: center[0] + radius / 2,
	// 						y: center[1],
	// 					};
	// 					path = shapeData({name: shape.name, start: startPoint, end: endPoint});
	// 					break;
	// 				}

	// 				default: {
	// 					console.log(shape);
	// 					const points = shape.map(point => ({x: point[0], y: point[1]}));
	// 					path = getPathFromPoints(points);
	// 					break;
	// 				}
	// 			}

	// 			// Console.log(shapePoints);
	// 			console.log(path);
	// 			currentPath.path = path;
	// 			setCurrentPath({
	// 				...currentPath,
	// 				path,
	// 				updatedAt: new Date().toISOString(),
	// 			});

	// 			/*
    //   // && existingPaths.current.length > 0
    //   const revisedLastPoint = getSnappingPoint(existingPaths.current, {x: event.x, y: event.y}, canvasScale, canvasTranslate);
    //   //replace last point in current path
    //   // since handle drawing point is not extending this point, lets do it here for now
    //   // this must be cleaned up later once it works as poc
    //   let revisedCurrentPath = replaceLastPoint(currentPath.path, revisedLastPoint);

    //   const current5Points = get5PointsFromPath(revisedCurrentPath);
    //   console.log(current5Points, 'current5Points')
    //   const currentPath5PointsLength = getPathLength(current5Points);

    //   // lets see if the path is fairly striaght
    //   if (isLineMeantToBeStraight(current5Points)) {
    //     // The line is meant to be straight
    //     console.log('found straight line, replacing it..')
    //     revisedCurrentPath = getPathFromPoints([current5Points[0], current5Points[4]]);
    //     setCurrentPath({
    //       ...currentPath,
    //       path: revisedCurrentPath,
    //       updatedAt: new Date().toISOString(),
    //     });
    //     return;
    //   } else {
    //     console.log('Straight line identification failed');
    //   }

    //   // let save this one atleast
    //   setCurrentPath({
    //     ...currentPath,
    //     path: revisedCurrentPath,
    //   });
    //   // Now re-asses the whole path, is there a line parallel to this  path within tolerance based on its starting and end point
    //   // parallel could be  straight line or curved line
    //   // if yes, then replace the path with this parallel path

    //   existingPaths.current.forEach((path) => {
    //     // with each path, check if there length is within tolerance matches,
    //     // if so --lets check 4 points with current path
    //     // start point, end point and 2 points in between
    //     // if the distances are within tolerance, then we have a parallel path
    //     // we will just replicate the same path  this starting and end point

    //     const path5Points = get5PointsFromPath(path.path);
    //     const path5PointsLength = getPathLength(path5Points);

    //     if (Math.abs(currentPath5PointsLength - path5PointsLength) > snappingTolerance) {
    //       return;
    //     }
    //       // lets check the distance between 5 points
    //      //first distance
    //      let distance = calculateDistance(current5Points[0], path5Points[0]);
    //      if (distance > snappingTolerance) {
    //        return;
    //      }
    //       //second distance
    //       distance = calculateDistance(current5Points[1], path5Points[1]);
    //       if (distance > snappingTolerance) {
    //         return;
    //       }
    //       //third distance
    //       distance = calculateDistance(current5Points[2], path5Points[2]);
    //       if (distance > snappingTolerance) {
    //         return;
    //       }
    //       //fourth distance
    //       distance = calculateDistance(current5Points[3], path5Points[3]);
    //       if (distance > snappingTolerance) {
    //         return;
    //       }
    //       //fifth distance
    //       distance = calculateDistance(current5Points[4], path5Points[4]);
    //       if (distance > snappingTolerance) {
    //         return;
    //       }
    //       // we found the match
    //       // lets translate this path to current paths position
    //       // replace first and last point, and adjust the inbetween points accordingly
    //       // now we must use getPointsFromPath to get the points from path
    //       const pathPoints = getPointsFromPath(path.path);
    //       const firstPoint = pathPoints[0];
    //       const lastPoint = pathPoints[pathPoints.length - 1];
    //       const dx = current5Points[0].x - firstPoint.x;
    //       const dy = current5Points[0].y - firstPoint.y;
    //       const newPoints = pathPoints.map((point) => {
    //         return {
    //           x: point.x + dx,
    //           y: point.y + dy,
    //         };
    //       });
    //       // does last point match? if not readjust from last point
    //       const lastPointDistance = calculateDistance(lastPoint, current5Points[4]);
    //       if (lastPointDistance > snappingTolerance) {
    //         const dx = current5Points[4].x - lastPoint.x;
    //         const dy = current5Points[4].y - lastPoint.y;
    //         newPoints.forEach((point) => {
    //           point.x += dx;
    //           point.y += dy;
    //         });
    //       }
    //       // make sure first and last point exactly matches so replace them with our ones
    //       newPoints[0] = current5Points[0];
    //       newPoints[newPoints.length - 1] = current5Points[4];

    //       console.log('we are replacing the line');
    //       // now convert this path to string
    //       const newPath = getPathFromPoints(newPoints);
    //       setCurrentPath({
    //         ...currentPath,
    //         path: newPath,
    //       });
    //       // This should make parallel straight line or curved line, finger crossed
    //   }); */
	// 		}
		}
	};

	const panDrawGesture = Gesture.Pan();
	panDrawGesture.shouldCancelWhenOutside(false);
	panDrawGesture.minPointers(1);
	panDrawGesture.maxPointers(1);
	panDrawGesture.onBegin(async event => handlePanDrawingEvent(event, 'began'))
		.onUpdate(async event => handlePanDrawingEvent(event, 'active'))
		.onEnd(async event => handlePanDrawingEvent(event, 'ended'));

	// --------------------------------------

	// For paths selection on screen
	const doubleTapSelectGesture = Gesture.Tap();
	doubleTapSelectGesture.numberOfTaps(2).onEnd(event => {
		const tapPoint = {
			x: event.x * canvasScale + canvasTranslate.x,
			y: event.y * canvasScale + canvasTranslate.y,
		};
		handleSelectEvent({...tapPoint}, activeBoundaryBoxPath, setMyPathData, true);
	});

	// Once select mode is activated by double tap, single tap can also select the path
	// handy but creating confusion
	const tapSelectGesture = Gesture.Tap();
	tapSelectGesture.numberOfTaps(1).onEnd(event => {
		if (!activeBoundaryBoxPath) {
			return;
		}

		const tapPoint = {
			x: event.x * canvasScale + canvasTranslate.x,
			y: event.y * canvasScale + canvasTranslate.y,
		};
		handleSelectEvent({...tapPoint}, activeBoundaryBoxPath, setMyPathData, false);
	});

	//--------------------------------------
	const resetBoundaryBox = () => {
		const selectedPaths = myPathData.pathData.filter(item => item.selected === true);
		const bBoxPath = getBoundaryBox(selectedPaths);
		setActiveBoundaryBoxPath(bBoxPath);
	};

	// For moving paths on screen
	const panDragEvent = debounce((event, state) => {
		if (!activeBoundaryBoxPath || editMode) {
			return;
		}

		const tapPoint = {
			x: event.x * canvasScale + canvasTranslate.x,
			y: event.y * canvasScale + canvasTranslate.y,
		};
		// If tapPoint is within the boundary box, move the boundary box
		// else allow to draw the free path which will select the paths on the way
		const panTranslatePoint = {
			x: event.translationX * canvasScale,
			y: event.translationY * canvasScale,
		};
		handleDragEvent({...panTranslatePoint}, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
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
		resetBoundaryBox();
	});

	// Two finger canvas pan
	const startPoint = useRef({x: 0, y: 0});
	const panDrag2CanvasTranslate = useRef({x: 0, y: 0});
	const panDrag2Gesture = Gesture.Pan();
	panDrag2Gesture.shouldCancelWhenOutside(false);
	// PanDrag2Gesture.enableTrackpadTwoFingerGesture(true);
	panDrag2Gesture.minPointers(2);
	panDrag2Gesture.maxPointers(2);
	panDrag2Gesture.onBegin(event => {
		if (activeBoundaryBoxPath) {
			return;
		}

		// Actually it may as well be two finger tap
		startPoint.current = {x: event.x, y: event.y};
	});

	const debouncedUpdate = debounce((event: {x: number; y: number}) => {
		if (activeBoundaryBoxPath) {
			return;
		}

		const xTranslate = (event.x - startPoint.current.x) * canvasScale;
		const yTranslate = (event.y - startPoint.current.y) * canvasScale;

		setCanvasTranslate(previous => {
			panDrag2CanvasTranslate.current.x = previous.x - xTranslate;
			panDrag2CanvasTranslate.current.y = previous.y - yTranslate;
			return {...panDrag2CanvasTranslate.current};
		});

		startPoint.current = {x: event.x, y: event.y};
	}, 5, {leading: I_AM_ANDROID, trailing: I_AM_IOS});

	panDrag2Gesture.onUpdate(debouncedUpdate);

	panDrag2Gesture.onEnd(() => {
		debouncedUpdate.cancel();
		// SetTimeout(() => { // snap prevention
		startPoint.current = {x: 0, y: 0};
		// Save the sketch
		setMyPathData(previous => ({
			...previous,
			metaData: {
				...previous.metaData,
				viewBox: `${panDrag2CanvasTranslate.current.x} ${panDrag2CanvasTranslate.current.y} ${SCREEN_WIDTH * canvasScale} ${SCREEN_HEIGHT * canvasScale}`,
				updatedAt: '',
			},
			updatedAt: new Date().toISOString(),
		}));
		// }, 200);
	});

	const pinch2CanvasScale = useRef(canvasScale);
	// For scaling of path
	const pinchZoomEvent = debounce((event, state) => {
		if (activeBoundaryBoxPath && !editMode) {
			const focalPoint = {
				x: event.focalX * canvasScale + canvasTranslate.x,
				y: event.focalY * canvasScale + canvasTranslate.y,
			};
			handleScaleEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath, scaleMode, setScaleMode, focalPoint);
		} else { // There was no boundary box, so no path was selected
			if (state === 'began') {
				pinch2CanvasScale.current = event.scale;
				// MyConsole.log('scaling started', event.scale);
			} else if (state === 'end') {
				pinch2CanvasScale.current = 1;
			} else {
				// MyConsole.log('scaling update', event.scale);
				// let do this for canvas scale
				let scale = precise(canvasScale * pinch2CanvasScale.current / event.scale, 2);
				if (scale < 0.25) {
					scale = 0.25;
				}

				if (scale > 2.5) {
					scale = 2.5;
				}

				setCanvasScale(scale);
				pinch2CanvasScale.current = event.scale;
			}
		}
	}, 5, {leading: I_AM_ANDROID, trailing: I_AM_IOS});

	const pinchZoomGesture = Gesture.Pinch();
	pinchZoomGesture.onBegin(event => {
		pinchZoomEvent.cancel();
		pinchZoomEvent(event, 'began');
	});
	pinchZoomGesture.onUpdate(event => pinchZoomEvent(event, 'active'));
	pinchZoomGesture.onEnd(event => {
		pinchZoomEvent.flush();
		pinchZoomEvent(event, 'ended');
		resetBoundaryBox();
		setScaleMode('XY');
	});

	// For rotation of path
	const rotateEvent = debounce((event, state) => {
		const pivot = {
			x: event.anchorX * canvasScale + canvasTranslate.x,
			y: event.anchorY * canvasScale + canvasTranslate.y,
		};
		handleRotateEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath, pivot);
	}, 5, {leading: I_AM_ANDROID, trailing: I_AM_IOS});

	const rotateGesture = Gesture.Rotation();
	rotateGesture.onBegin(event => {
		rotateEvent.cancel();
		rotateEvent(event, 'began');
	})
		.onUpdate(event => rotateEvent(event, 'active'))
		.onEnd(event => {
			rotateEvent(event, 'ended');
			resetBoundaryBox();
		});

	// Combine all gestures and initialize
	// const composedPanTap = Gesture.Simultaneous(doubleTapSelectGesture);
	const composedPanDrag = Gesture.Simultaneous(panDrawGesture, panDragGesture);
	const composedPinch = Gesture.Simultaneous(Gesture.Race(pinchZoomGesture, rotateGesture), panDrag2Gesture);
	const composedSelect = Gesture.Exclusive(doubleTapSelectGesture, tapSelectGesture);
	const composedGesture = Gesture.Race(composedPinch, composedPanDrag, composedSelect);
	composedGesture.initialize();

	return (
		<GestureDetector gesture={composedGesture}>
			{children}
		</GestureDetector>
	);
};
