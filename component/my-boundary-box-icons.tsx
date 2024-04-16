
// BoundaryBox.tsx
import React, {useContext, useState} from 'react';
import {Alert, View} from 'react-native';
import {
	doPathIntersect, flipPoints, getPathFromPoints, getPathLength, getPointsFromPath, getViewBoxTrimmed, isPath1InsidePath2,
} from '@u/helper';
import {
	CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH, HEADER_HEIGHT, PointType,
} from '@u/types';
import {MyPathDataContext} from '@x/svg-data';
import * as Crypto from 'expo-crypto';
import {ToastContext} from '@x/toast-context';
import {
	polygon, union, difference, intersect, multiPolygon, Position, booleanDisjoint,
} from '@turf/turf';
import {polygonContains, polygonHull} from 'd3-polygon';
import {Divider} from './controls';
import myConsole from './my-console-log';
import MyIcon from './my-icon';

const BoundaryBoxIcons = ({
	activeBoundaryBoxPath,
	scaleMode,
	onScaleModeChange,
}) => {
	if (!activeBoundaryBoxPath?.visible) {
		return null;
	}

	const {myPathData, setMyPathData} = useContext(MyPathDataContext);
    type PathStyleType = {
    	strokeWidth: number;
    	stroke: string;
    	strokeOpacity: number;
    	fill: string;
    };
    const [styleClipBoard, setStyleClipBoard] = useState<PathStyleType | undefined>(null);

    const {showToast} = useContext(ToastContext);

    const applyFill = (fill: string) => {
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.selected === true) {
    				item.fill = fill;
    			}
    		}

    		return {...previous, metaData: {...previous.metaData, updatedAt: ''}};
    	});
    	// setActiveBoundaryBoxPath(undefined);
    	close();
    };

    const closePath = () => {
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.selected === true) {
    				item.path += 'Z';
    				item.updatedAt = new Date().toISOString();
    			}
    		}

    		return {...previous, metaData: {...previous.metaData, updatedAt: ''}, updatedAt: new Date().toISOString()};
    	});
    	showToast('Path Closed!');
    };

    const copyStyle = () => {
    	for (const item of myPathData.pathData) {
    		if (item.selected === true) {
    			const pathStyle = {
    				strokeWidth: item.strokeWidth,
    				stroke: item.stroke,
    				strokeOpacity: item.strokeOpacity,
    				fill: item.fill,
    			} as PathStyleType;
    			setStyleClipBoard(pathStyle);
    			showToast('Style copied!');
    		}
    	}
    };

    const pasteStyle = () => {
    	if (styleClipBoard == null) {
    		return;
    	}

    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.selected === true) {
    				item.strokeWidth = styleClipBoard.strokeWidth;
    				item.stroke = styleClipBoard.stroke;
    				item.strokeOpacity = styleClipBoard.strokeOpacity;
    				item.fill = styleClipBoard.fill;
    				item.updatedAt = new Date().toISOString();
    			}
    		}

    		return {...previous, metaData: {...previous.metaData, updatedAt: ''}, updatedAt: new Date().toISOString()};
    	});
    	showToast('Style applied!');
    };

    const duplicateSelected = () => {
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.selected === true) {
    				const duplicate = {...item};
    				duplicate.guid = Crypto.randomUUID();
    				duplicate.selected = false;
    				previous.pathData.push(duplicate);
    			}
    		}

    		return {...previous, metaData: {...previous.metaData, updatedAt: (new Date()).toISOString()}};
    	});

    	showToast('Copy created!');
    };

    const flipPaths = (flipX = false, flipY = false) => {
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.selected === true) {
    				const points = getPointsFromPath(item.path);
    				const newPoints = flipPoints(points, flipX, flipY);
    				item.path = getPathFromPoints(newPoints);
    				item.updatedAt = Date.now().toString();
    			}
    		}

    		return {...previous, metaData: {...previous.metaData, updatedAt: ''}};
    	});
    	showToast('Flipped along ' + (flipX ? 'X' : '') + (flipY ? 'Y' : '') + ' axis!');
    };

    const deleteSelected = () => {
    	Alert.alert('Delete Path', 'Are you sure?', [
    		{text: 'Cancel', style: 'cancel'},
    		{
    			text: 'Delete',
    			async onPress() {
    				setMyPathData(previous => {
    					previous.pathData = previous.pathData.filter(item => item.selected !== true);
    					return {...previous, metaData: {...previous.metaData, updatedAt: ''}};
    				});
    				// setActiveBoundaryBoxPath(undefined);
    				showToast('Path deleted!');
    			},
    		},
    	]);
    };

    const unselect = () => {
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			item.selected = false;
    		}

    		return {
    			...previous, pathData: previous.pathData, metaData: {...previous.metaData, updatedAt: ''}, updatedAt: new Date().toISOString(),
    		};
    	});
    	// setActiveBoundaryBoxPath(undefined);
    	// myConsole.log("deleteSelected")
    };

    const handleScaleModePress = (mode: string) => {
    	onScaleModeChange(mode);
    	showToast('Scale axis changed to ' + mode + ' axis');
    };

    const operation = (name: string) => {
    	let operationFunction;
    	switch (name) {
    	case 'union': {
    		operationFunction = union;

    	break;
    	}

    	case 'intersect': {
    		operationFunction = intersect;

    	break;
    	}

    	case 'difference': {
    		operationFunction = difference;

    	break;
    	}

    	default: {
    		showToast('Operation not supported');
    		return;
    	}
    	}

    	const selectedPaths = myPathData.pathData.filter(item => item.selected === true);
    	if (selectedPaths.length !== 2) {
    		showToast('Select two paths to perform intersection operation');
    		return;
    	}

    	// Sort by updatedAt date
    	selectedPaths.sort((a, b) => new Date(b.updatedAt as any).getTime() - new Date(a.updatedAt as any).getTime());
    	const path1 = selectedPaths[1];
    	const path2 = selectedPaths[0];

    	const path1Points = getPointsFromPath(path1.path);
    	const path2Points = getPointsFromPath(path2.path);

    	// Check if first and last points are same
    	if (path1Points[0].x !== path1Points.at(-1).x || path1Points[0].y !== path1Points.at(-1).y) {
    		showToast('Path 1 is not closed');
    		return;
    	}

    	if (path2Points[0].x !== path2Points.at(-1).x || path2Points[0].y !== path2Points.at(-1).y) {
    		showToast('Path 2 is not closed');
    		return;
    	}

    	const path1Polygon = polygon([
    		path1Points.map(point => [point.x, point.y]),
    	]);
    	const path2Polygon = polygon([
    		path2Points.map(point => [point.x, point.y]),
    	]);

    	if (!path1Polygon || !path2Polygon) {
    		console.error('One or both of the polygons are undefined');
    		return;
    	}

    	if (booleanDisjoint(path1Polygon, path2Polygon)) {
    		showToast('Paths must intersect.');
    		return;
    	}

    	const operated = operationFunction(path1Polygon, path2Polygon);
    	const operatedPoints = operated?.geometry.coordinates[0].map(point => ({x: point[0], y: point[1]}));

    	if (!operatedPoints) {
    		showToast(name + ' operation failed');
    		return;
    	}

    	const operatedPath = getPathFromPoints(operatedPoints);
    	// Out of two selected paths, replace first one with unioned path and remove the second path
    	setMyPathData(previous => {
    		for (const item of previous.pathData) {
    			if (item.guid === path1.guid) {
    				item.path = operatedPath;
    				const length = getPathLength(operatedPoints);
    				item.time = item.time * length / item.length;
    				item.length = length;
    				item.selected = true;
    				item.updatedAt = new Date().toISOString();
    			}
    		}

    		previous.pathData = previous.pathData.filter(item => item.guid !== path2.guid);
    		return {...previous, metaData: {...previous.metaData, updatedAt: ''}, updatedAt: new Date().toISOString()};
    	});
    	showToast(name + ' operation performed');
    };

    const selectedPaths = myPathData.pathData.filter(item => item.selected === true);
    const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
    const vbbPoints = vbbox.split(' '); // This is relative to canvas
    const canvasPoints = CANVAS_VIEWBOX_DEFAULT.split(' '); // This is relative to screen

    const iconBoxWidth = 36;
    const iconBoxHeight = 32;
    const start = {
    	x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]) + Number.parseFloat(canvasPoints[0]),
    	y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(canvasPoints[1]) + 25,
    };
    if ((start.x + iconBoxWidth * 2) > CANVAS_WIDTH) {
    	start.x = CANVAS_WIDTH - iconBoxWidth * 2;
    }

    if ((start.y + iconBoxHeight) > CANVAS_HEIGHT) {
    	start.y = CANVAS_HEIGHT - iconBoxHeight;
    }

    const BbIcon = ({name, onPress, strokeWidth = 1, size = 20, marginBottom = 0, marginLeft = 5, color = '#6b0772', fill = 'none'}) => <MyIcon
    	name={name}
    	size={size}
    	color={color ?? '#6b0772'}
    	strokeWidth={strokeWidth}
    	fill={fill}
    	onPress={onPress}
    	style={{marginLeft, marginBottom}} />;

    const MyDivider = () => <Divider horizontal={true} width={20} height={2} color={'rgba(0,0,0,0.5)'} margin={6} />;

    return (
    	<View style={{
    		width: 36 * 2, // Auto/
    		flexDirection: 'row',
    		justifyContent: 'flex-start',
    		alignItems: 'flex-start',
    		position: 'absolute',
    		top: start.y - 15 < 0 ? 0 : start.y,
    		left: start.x < 0 ? 0 : start.x + 5,
    	}}>

    		<View style={{
    			width: 36, // Auto/
    			height: iconBoxHeight * 7 + 5,
    			flexDirection: 'column',
    			justifyContent: 'flex-start',
    			alignItems: 'center',
    			borderRadius: 10,
    			backgroundColor: 'rgba(150,150,250, 0.85)',
    			borderWidth: 0.7,
    			borderColor: 'rgba(0,0,0,0.5)',
    			padding: 7,
    			paddingBottom: 7,
    		}}>

    			<BbIcon size={18} marginBottom={1} strokeWidth={1.4} name={'duplicate'} onPress={duplicateSelected} />

    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} marginBottom={1} strokeWidth={2} name={'flip-horizontal'} onPress={() => {
    				flipPaths(true, false);
    			}} />
    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} strokeWidth={2} name={'flip-vertical'} onPress={() => {
    				flipPaths(false, true);
    			}} />
    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} color={scaleMode === 'X' ? '#4b0772' : undefined} strokeWidth={scaleMode === 'X' ? 15 : 8} name={'stretch-x'} onPress={() => {
    				handleScaleModePress(scaleMode === 'X' ? 'XY' : 'X');
    			}} />
    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} color={scaleMode === 'Y' ? '#4b0772' : undefined} strokeWidth={scaleMode === 'Y' ? 15 : 8} name={'stretch-y'} onPress={() => {
    				handleScaleModePress(scaleMode === 'Y' ? 'XY' : 'Y');
    			}} />
    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} marginBottom={2} name={'trash'} onPress={deleteSelected} />
    			<MyDivider />
    			<BbIcon size={20} color='blue' marginLeft={0} marginBottom={2} name={'ok'} onPress={unselect} />

    		</View>
    		<View style={{
    			width: 36, // Auto/
    			height: 'auto',
    			flexDirection: 'column',
    			justifyContent: 'flex-start',
    			alignItems: 'center',
    			borderRadius: 10,
    			backgroundColor: 'rgba(150,150,250, 0.85)',
    			borderWidth: 0.7,
    			borderColor: 'rgba(0,0,0,0.5)',
    			padding: 7,
    			paddingBottom: 7,
    		}}>

    			{selectedPaths.length === 1 && !selectedPaths[0].path.endsWith('Z')
   && <><BbIcon size={18} marginBottom={1} strokeWidth={3} name={'close-path'} onPress={closePath} /><MyDivider /></>
    			}

    			<BbIcon size={18} marginBottom={1} strokeWidth={1.4} name={'copy'} onPress={copyStyle} />
    			<MyDivider />
    			<BbIcon size={18} marginLeft={0} marginBottom={1} strokeWidth={2} name={'paste'} onPress={pasteStyle} />
    			{selectedPaths.length === 2 && doPathIntersect(selectedPaths[0].path, selectedPaths[1].path)
                    && <>
                    	<MyDivider />
                    	<BbIcon size={18} marginLeft={0} strokeWidth={1} color='#000000' fill='#000000' name={'union'} onPress={() => {
                    		operation('union');
                    	}} />

                    	<MyDivider />
                    	<BbIcon size={18} marginLeft={0} strokeWidth={2} name={'intersection'} fill='#000000' onPress={() => {
                    		operation('intersect');
                    	}} />
                    	<MyDivider />
                    	<BbIcon size={18} marginLeft={0} strokeWidth={2} fill='#000000' name={'difference'} onPress={() => {
                    		operation('difference');
                    	}} />
                    </>
    			}
    		</View>
    	</View>
    );
};

export default BoundaryBoxIcons;
