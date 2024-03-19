// BoundaryBox.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import MyPath from "@c/my-path";
import { createPathdata, getViewBoxTrimmed } from "@u/helper";
import { shapeData } from "@u/shapes";
import { CANVAS_VIEWBOX, MY_BLACK, PathDataType, PointType } from "@u/types";
import MyIcon from './my-icon';
import { SvgDataContext } from '@x/svg-data';


export const getBoundaryBox = (selectedPaths: PathDataType[]): PathDataType | null => {
    if (selectedPaths.length === 0) {
        return null;
    }
    let maxStrokeWidth = 0;
    selectedPaths.forEach((item) => {
        if (item.strokeWidth > maxStrokeWidth) {
            maxStrokeWidth = item.strokeWidth;
        }
    });
    let offset = maxStrokeWidth / 2 + 2;
    const vbbox = getViewBoxTrimmed(selectedPaths, offset);
    const vbbPoints = vbbox.split(" ");
    const rectPath = shapeData({
        name: "rectangle",
        start: { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) },
        end: { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) }
    });

    let path = rectPath;
    const rectPathData = createPathdata("#fdf9b4", 3, 1);
    rectPathData.visible = true;
    rectPathData.path = path;
    rectPathData.strokeDasharray = "7,7";
    rectPathData.strokeDashoffset = 4;
    return rectPathData;
}


const BoundaryBoxIcons = ({
    activeBoundaryBoxPath,
    // setActiveBoundaryBoxPath,
}) => {
    const {svgData, setSvgData} = useContext(SvgDataContext);

    type PathStyleType = {
        strokeWidth: number,
        stroke: string,
        strokeOpacity: number, s
        fill: string
    }
    const [styleClipBoard, setStyleClipBoard] = useState<PathStyleType | null>(null);


    const applyFill = (fill: string) => {
        setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    item.fill = fill;
                }
            });
            return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
        });
        // setActiveBoundaryBoxPath(null);
        close();
    }

    const copyStyle = () => {
        svgData.pathData.forEach((item) => {
            if (item.selected === true) {
                const pathStyle = {
                    strokeWidth: item.strokeWidth,
                    stroke: item.stroke,
                    strokeOpacity: item.strokeOpacity,
                    fill: item.fill,
                } as PathStyleType;
                setStyleClipBoard(pathStyle);
            }
        });
        close();
    }

    const pasteStyle = () => {
        if (styleClipBoard == null) return;
        setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    item.strokeWidth = styleClipBoard.strokeWidth;
                    item.stroke = styleClipBoard.stroke;
                    item.strokeOpacity = styleClipBoard.strokeOpacity;
                    item.fill = styleClipBoard.fill;
                }
            });
            return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
        });
        // setActiveBoundaryBoxPath(null);
        close();
    }

    const duplicateSelected = () => {
        setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    const duplicate = { ...item };
                    duplicate.guid = Crypto.randomUUID();
                    duplicate.selected = false;
                    prev.pathData.push(duplicate);
                }
            });
            return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
        });
        // setActiveBoundaryBoxPath(null);
        close();
        console.log("duplicateSelected")
    }

    const deleteSelected = () => {
        setSvgData((prev) => {
            prev.pathData = prev.pathData.filter((item) => item.selected !== true);
            return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
        });
        // setActiveBoundaryBoxPath(null);
        console.log("deleteSelected")
    }

    const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
    const vbbPoints = vbbox.split(" "); // this is relative to canvas
    const canvasPoints = CANVAS_VIEWBOX.split(" "); // this is relative to screen

    const iconBoxHeight = 30;
    const start = {
        x: parseFloat(vbbPoints[0]) + parseFloat(canvasPoints[0]),
        y: parseFloat(vbbPoints[1]) + parseFloat(canvasPoints[1]) - iconBoxHeight,
    }
    const BbIcon = ({ name, onPress }) => {
        return (
            <MyIcon
                name={name}
                size={24}
                color={MY_BLACK}
                strokeWidth={2}
                onPress={onPress}
            />
        )
    };

    return (<View style={{
        position: 'absolute',
        top: start.y ,
        left: start.x ,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // width: 100, // auto/
        height: 25,
    }}>
        {/* <BbIcon name={'duplicate'} onPress={duplicateSelected} />
        <BbIcon name={'copy'} onPress={copyStyle} />
        <BbIcon name={'paste'} onPress={pasteStyle} /> */}
        <BbIcon name={'trash'} onPress={deleteSelected} />
    </View>
    )
}


const BoundaryBoxCornors: React.FC<{activeBoundaryBoxPath: PathDataType}> = ({activeBoundaryBoxPath}) => {
    if (!activeBoundaryBoxPath || !activeBoundaryBoxPath.path) return null;
    const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
    const vbbPoints = vbbox.split(" ");
    // Create corner paths
    const cornerStrokeWidth = 5;
    // make cornerLength proportional to the size of the boundary box
    const cornerLength = Math.min(parseFloat(vbbPoints[2]), parseFloat(vbbPoints[3])) / 10;
    const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
    const cornerPaths = corners.flatMap(corner => {
        const cornerPathData1 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
        const cornerPathData2 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
        cornerPathData1.visible = true;
        cornerPathData2.visible = true;
        cornerPathData1.strokeDasharray = "0"; // Solid line
        cornerPathData2.strokeDasharray = "0"; // Solid line
        cornerPathData1.strokeDashoffset = 0;
        cornerPathData2.strokeDashoffset = 0;

        // Adjust start and end points based on the corner
        let start1: PointType;
        let end1: PointType;
        let start2: PointType;
        let end2: PointType;

        switch (corner) {
            case 'topLeft':
                start1 = { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) };
                end1 = { x: start1.x + cornerLength, y: start1.y };
                start2 = { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) };
                end2 = { x: start2.x, y: start2.y + cornerLength };
                break;
            case 'topRight':
                start1 = { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) };
                end1 = { x: start1.x - cornerLength, y: start1.y };
                start2 = { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) };
                end2 = { x: start2.x, y: start2.y + cornerLength };
                break;
            case 'bottomLeft':
                start1 = { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) };
                end1 = { x: start1.x + cornerLength, y: start1.y };
                start2 = { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) };
                end2 = { x: start2.x, y: start2.y - cornerLength };
                break;
            case 'bottomRight':
                start1 = { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) };
                end1 = { x: start1.x - cornerLength, y: start1.y };
                start2 = { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) };
                end2 = { x: start2.x, y: start2.y - cornerLength };
                break;
            default:
                start1 = { x: 0, y: 0 };
                end1 = { x: 0, y: 0 };
                start2 = { x: 0, y: 0 };
                end2 = { x: 0, y: 0 };
                break;
        }

        const cornerPath1 = shapeData({
            name: "line",
            start: start1,
            end: end1
        });

        const cornerPath2 = shapeData({
            name: "line",
            start: start2,
            end: end2
        });

        cornerPathData1.path = cornerPath1;
        cornerPathData2.path = cornerPath2;

        return [cornerPathData1, cornerPathData2];
    });


    return (
        <>
            {cornerPaths.map((cornerPath, index) => (
                <MyPath
                    key={index}
                    keyProp={'cornerPath' + index}
                    prop={cornerPath}
                />
            ))}
        </>
    )
}

const AnimatedBboxPath = Animated.createAnimatedComponent(MyPath);

type BoundaryBoxProps = {
    activeBoundaryBoxPath: PathDataType | null;
};

const MyBoundaryBox: React.FC<BoundaryBoxProps> = ({ activeBoundaryBoxPath }) => {
    const animatedBboxValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        return () => {
            animatedBboxValue.stopAnimation();
        }
    }, []);

    useEffect(() => {
        if (activeBoundaryBoxPath && activeBoundaryBoxPath.visible) {
            Animated.loop(
                Animated.timing(animatedBboxValue, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false,
                })
            ).start();
        }
    }, [activeBoundaryBoxPath]);

    const strokeColor = animatedBboxValue.interpolate({
        inputRange: [0, 0.75, 1],
        outputRange: ['#6683c4', '#0b1870', '#410170'],
    });


    // get accessories like 4 cornors & relevant icons


    return (
        activeBoundaryBoxPath && activeBoundaryBoxPath.visible && (
            <>
                <AnimatedBboxPath
                    keyProp={"selectBoundaryBox"}
                    key={"selectBoundaryBox"}
                    prop={{
                        ...activeBoundaryBoxPath,
                        stroke: strokeColor,
                        strokeDashoffset: animatedBboxValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [7, -7],
                        })
                    }} />
                <BoundaryBoxCornors activeBoundaryBoxPath={activeBoundaryBoxPath} />
                <BoundaryBoxIcons activeBoundaryBoxPath={activeBoundaryBoxPath} />
                </>
        )
    );
};


export default MyBoundaryBox;