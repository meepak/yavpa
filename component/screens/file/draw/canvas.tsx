import React, {
	useContext, useEffect, useRef, useState,
} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import Svg from 'react-native-svg';
import {createPathdata} from '@u/helper';
import {
	CANVAS_HEIGHT,
	CANVAS_VIEWBOX_DEFAULT,
	CANVAS_WIDTH,
	DEFAULT_SIMPLIFY_TOLERANCE,
	DEFAULT_STROKE_OPACITY,
	DEFAULT_STROKE_WIDTH,
	MY_BLACK,
	type PathDataType,
	PathPointType,
	type PointType,
	type ShapeType,
} from '@u/types';
import MyPath from '@c/my-path';
import {MyPathDataContext} from '@x/svg-data';
import {defaultShape} from '@u/shapes';
import ErrorBoundary from '@c/error-boundary';
import MyBoundaryBoxPaths from '@c/my-boundary-box-paths';
import BoundaryBoxIcons from '@c/my-boundary-box-icons';
import MyPathImage from '@c/my-path-image';
import MyPen from '@c/my-pen';
import type * as D3Path from 'd3-path';
import {MyGestures} from './canvas/my-gestures';
import {useSelectEffect} from './canvas/use-select-effect';
import {useCommandEffect} from './canvas/use-command-effect';
import {PathEditGestures} from './canvas/path-edit/path-edit-gestures';

type SvgCanvasProperties = {
	selectedPaths?: PathDataType[];
	setSelectedPaths?: React.Dispatch<React.SetStateAction<PathDataType[]>>;
	editable?: boolean;
	erasing?: boolean;
	enhancedDrawing?: boolean;
	pathEditing?: boolean;
	command?: string;
	forceUpdate?: number;
	strokeWidth?: number;
	stroke?: string;
	strokeOpacity?: number;
	simplifyTolerance?: number;
	d3CurveBasis?: any;
};

const SvgCanvas: React.FC<SvgCanvasProperties> = properties => {
	const {
		editable = true,
		erasing = false,
		enhancedDrawing = false,
		pathEditing = false,
		command = '',
		forceUpdate = 0,
		strokeWidth = DEFAULT_STROKE_WIDTH,
		strokeOpacity = DEFAULT_STROKE_OPACITY,
		stroke = MY_BLACK,
		simplifyTolerance = DEFAULT_SIMPLIFY_TOLERANCE,
		d3CurveBasis = null,
	} = properties;

	const {myPathData, setMyPathData} = useContext(MyPathDataContext);
	const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

	const [currentPath, setCurrentPath] = useState(newPathData());
	const [startTime, setStartTime] = useState(0);
	const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);
	const [editMode, setEditMode] = useState(editable);
	const [enhancedDrawingMode, setEnhancedDrawingMode]
    = useState(enhancedDrawing);
	const [pathEditMode, setPathEditMode] = useState(pathEditing);
	const [editedPath, setEditedPath] = useState<typeof D3Path>();
	const currentPathPointType = useRef<PathPointType>(PathPointType.None);
	const [pathEditPoints, setPathEditPoints] = useState<
	Array<{point: PointType; type: PathPointType}>
	>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [activeBoundaryBoxPath, setActiveBoundaryBoxPath]
    = useState<PathDataType | undefined>();

	const [penTip, setPenTip] = useState<PointType | undefined>();
	const penTipRef = useRef<PointType | undefined>();

	const [scaleMode, setScaleMode] = useState<'X' | 'Y' | 'XY'>('XY');

	const [canvasScale, setCanvasScale] = useState(1);
	const [canvasTranslate, setCanvasTranslate] = useState({x: 0, y: 0});
	const [canvasViewBox, setCanvasViewBox] = useState(
		myPathData.metaData.viewBox || CANVAS_VIEWBOX_DEFAULT,
	);

	// This is be enabled in next version only
	// erasure mode - erasure shape can be square or circle
	const [erasureMode, setErasureMode] = useState(false);
	useEffect(() => {
		setErasureMode(erasing);
	}, [erasing]);

	useEffect(() => {
		setEnhancedDrawingMode(enhancedDrawing);
	}, [enhancedDrawing]);

	useEffect(() => {
		setPathEditMode(pathEditing);
	}, [pathEditing]);

	useEffect(() => {
		setIsLoading(false);
		return () => {
			setMyPathData(previous => {
				for (const item of previous.pathData) {
					(item.selected = false);
				}

				return previous;
			});
		};
	}, []);

	// If editable is true switch to writing mode
	// else reset selet mode to allow eslect from start
	useEffect(() => {
		setEditMode(editable);
		if (editable && activeBoundaryBoxPath) {
			setActiveBoundaryBoxPath(undefined);
		}
	}, [editable]);

	// TODO DO NOT STORE VIEWBOX IN METADATA, INSTEAD STORE
	// TOOD CANVAS WIDTH, CANVAS HEIGHT, CANVAS SCALE, CANVAS TRANSLATE
	// TODO AND JUST RECALCULATE VIEWBOX ON THE FLY
	useEffect(() => {
		setCanvasViewBox(
			`${canvasTranslate.x} ${canvasTranslate.y} ${CANVAS_WIDTH * canvasScale} ${CANVAS_HEIGHT * canvasScale}`,
		);
	}, [canvasTranslate, canvasScale]);

	// Get bounding box of selected paths
	useSelectEffect({
		myPathData,
		setMyPathData,
		setEditMode,
		setActiveBoundaryBoxPath,
		stroke,
		strokeWidth,
		strokeOpacity,
	});

	useCommandEffect(
		command,
		editMode,
		newPathData,
		myPathData,
		setMyPathData,
		setCurrentPath,
		setCurrentShape,
		forceUpdate,
	);

	const myGestureProperties = {
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
	};

	const pathEditGestureProperties = {
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
	};

	const Gestures = ({children}) =>
		pathEditMode ? (
			<PathEditGestures {...pathEditGestureProperties}>{children}</PathEditGestures>
		) : (
			<MyGestures {...myGestureProperties}>{children}</MyGestures>
		);

	return (
    <View style={styles.container} pointerEvents="box-none">
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating size={200} color={MY_BLACK} />
        </View>
      ) : (
        <ErrorBoundary>
          <MyGestures {...myGestureProperties}>
            <View style={styles.container}>
              <Svg
                width={"100%"}
                height={"100%"}
                viewBox={canvasViewBox}
                onLayout={() => {
                  setIsLoading(false);
                }}
              >
                {pathEditMode && (
                  <MyPen
                    tip={
                      penTip || {
                        x: (CANVAS_WIDTH / 2) * canvasScale + canvasTranslate.x,
                        y:
                          (CANVAS_HEIGHT / 2) * canvasScale + canvasTranslate.y,
                      }
                    }
                  />
                )}

                {myPathData.imageData?.map((item) =>
                  item.visible ? (
                    <MyPathImage
                      prop={item}
                      keyProp={"completed-" + item.guid}
                      key={item.guid}
                    />
                  ) : null,
                )}

                {myPathData.pathData.map((item, _index) =>
                  item.visible ? (
                    <MyPath
                      prop={item}
                      keyProp={"completed-" + item.updatedAt}
                      key={item.guid}
                    />
                  ) : null,
                )}

                {currentPath.guid !== "" && (
                  <MyPath
                    prop={currentPath}
                    keyProp={"current"}
                    key={currentPath.guid}
                  />
                )}

                <MyBoundaryBoxPaths
                  activeBoundaryBoxPath={activeBoundaryBoxPath}
                />
              </Svg>
            </View>
          </MyGestures>

          <BoundaryBoxIcons
            activeBoundaryBoxPath={activeBoundaryBoxPath}
            scaleMode={scaleMode}
            onScaleModeChange={(value) => {
              setScaleMode(value);
            }}
          />
        </ErrorBoundary>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
	container: {
		// Flex: 1,
		// overflow: 'hidden',
	},
	flex1: {
		flex: 1,
	},
});

export default SvgCanvas;
