// BoundaryBox.tsx
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import MyPath from "@c/my-path";
import { createPathdata, getViewBoxTrimmed } from "@u/helper";
import { shapeData } from "@u/shapes";
import { CANVAS_PATH, PathDataType } from "@u/types";

// TODO There is more room for refactoring and no one else need to call getBoundaryBox explicitly

export const getBoundaryBox = (selectedPaths: PathDataType[]): PathDataType|null => {
    if(selectedPaths.length === 0) {
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
    const rectPathData = createPathdata("url(#MYIR1)", 3, 1);
    rectPathData.visible = true;
    rectPathData.path = path;
    rectPathData.strokeDasharray = "7,7";
    rectPathData.strokeDashoffset = 4;
    return rectPathData;
}

export const getCanvasAsBoundaryBox = () => {
    const pathData = createPathdata("#fdf9b4", 7, 1);
    pathData.path = CANVAS_PATH;
    pathData.strokeDasharray = "7,7";
    pathData.strokeDashoffset = 0;
    return pathData;
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
    },[]);

    useEffect(() => {
        if(activeBoundaryBoxPath && activeBoundaryBoxPath.visible) {
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

    return (
        activeBoundaryBoxPath && activeBoundaryBoxPath.visible && (
            <AnimatedBboxPath
                keyProp={"selectBoundaryBox"}
                key={"selectBoundaryBox"}
                prop={{
                    ...activeBoundaryBoxPath,
                    // stroke: strokeColor,
                    strokeDashoffset: animatedBboxValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [7, 0],
                    })
                }}
            />
        )
    );
};


export default MyBoundaryBox;