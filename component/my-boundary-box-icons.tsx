
// BoundaryBox.tsx
import React, { useContext, useState } from 'react';
import { Alert, View } from 'react-native';
import { flipPoints, getPathFromPoints, getPointsFromPath, getViewBoxTrimmed } from "@u/helper";
import { CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH, HEADER_HEIGHT } from "@u/types";
import MyIcon from './my-icon';
import { MyPathDataContext } from '@x/svg-data';
import * as Crypto from "expo-crypto";
import myConsole from './my-console-log';
import { Divider } from './controls';


const BoundaryBoxIcons = ({
    activeBoundaryBoxPath,
    scaleMode,
    onScaleModeChange,
}) => {

    if (!activeBoundaryBoxPath || !activeBoundaryBoxPath.visible) {
        return null;
    }

    const { myPathData, setMyPathData } = useContext(MyPathDataContext);
    type PathStyleType = {
        strokeWidth: number,
        stroke: string,
        strokeOpacity: number, s
        fill: string
    }
    const [styleClipBoard, setStyleClipBoard] = useState<PathStyleType | null>(null);


    const applyFill = (fill: string) => {
        setMyPathData((prev) => {
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
        myPathData.pathData.forEach((item) => {
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
        setMyPathData((prev) => {
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
        setMyPathData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    const duplicate = { ...item };
                    duplicate.guid = Crypto.randomUUID();
                    duplicate.selected = false;
                    prev.pathData.push(duplicate);
                }
            });
            return { ...prev, metaData: { ...prev.metaData, updatedAt: (new Date()).toISOString()} };
        });

        myConsole.log("duplicateSelected")
    }

    const flipPaths = (flipX = false, flipY = false) => {
        setMyPathData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    const points = getPointsFromPath(item.path);
                    const newPoints = flipPoints(points, flipX, flipY);
                    item.path = getPathFromPoints(newPoints);
                    item.updatedAt = Date.now().toString();
                }
            });
            return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
        });
    }

    const deleteSelected = () => {

        Alert.alert("Delete Path", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: async () => {

                    setMyPathData((prev) => {
                        prev.pathData = prev.pathData.filter((item) => item.selected !== true);
                        return { ...prev, metaData: { ...prev.metaData, updatedAt: "" } };
                    });
                    // setActiveBoundaryBoxPath(null);
                    myConsole.log("deleteSelected")
                },
            },
        ]);
    }

    const unselect = () => {

        setMyPathData((prev) => {
            prev.pathData.forEach((item) => item.selected = false);
            return { ...prev, pathData:prev.pathData, metaData: { ...prev.metaData, updatedAt: "" }, updatedAt: new Date().toISOString() };
        });
        // setActiveBoundaryBoxPath(null);
        myConsole.log("deleteSelected")
    }

    const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
    const vbbPoints = vbbox.split(" "); // this is relative to canvas
    const canvasPoints = CANVAS_VIEWBOX_DEFAULT.split(" "); // this is relative to screen

    const iconBoxWidth = 36;
    const iconBoxHeight = 235;
    const start = {
        x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]) + parseFloat(canvasPoints[0]),
        y: parseFloat(vbbPoints[1]) + parseFloat(canvasPoints[1])+25,
    }
    if (start.x + iconBoxWidth > CANVAS_WIDTH) start.x = CANVAS_WIDTH - iconBoxWidth;
    if (start.y + iconBoxHeight > CANVAS_HEIGHT) start.y = CANVAS_HEIGHT - iconBoxHeight;
    const BbIcon = ({ name, onPress, strokeWidth = 1, size = 20, marginBottom = 0, marginLeft = 5, color = '#6b0772' }) => {
        return <MyIcon
            name={name}
            size={size}
            color={color ?? '#6b0772'}
            strokeWidth={strokeWidth}
            onPress={onPress}
            style={{ marginLeft: marginLeft, marginBottom: marginBottom, }} />

    };

    const MyDivider = () => <Divider horizontal={true} width={20} height={2} color={'rgba(0,0,0,0.5)'} margin={6} />

    return (

        <View style={{
            width: 36, // auto/
            height: iconBoxHeight,
            position: 'absolute',
            top: start.y - 15 < 0 ? 0 : start.y,
            left: start.x < 0 ? 0 : start.x + 5,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: `rgba(150,150,250, 0.85)`,
            borderWidth: 0.7,
            borderColor: "rgba(0,0,0,0.5)",
            padding: 7,
            paddingBottom: 7
        }}>

            <BbIcon size={18} marginBottom={1} strokeWidth={1.4} name={'duplicate'} onPress={duplicateSelected} />

            <MyDivider/>
            <BbIcon size={18} marginLeft={0} marginBottom={1} strokeWidth={2} name={'flip-horizontal'} onPress={() => flipPaths(true, false)} />
            <MyDivider />
            <BbIcon size={18} marginLeft={0} strokeWidth={2} name={'flip-vertical'} onPress={() => flipPaths(false, true)} />
            <MyDivider />
            <BbIcon size={18} marginLeft={0} color={scaleMode === 'X' ? '#4b0772' : undefined} strokeWidth={scaleMode === 'X' ? 15 : 8} name={'stretch-x'} onPress={() => onScaleModeChange('X')} />
            <MyDivider />
            <BbIcon size={18} marginLeft={0} color={scaleMode === 'Y' ? '#4b0772' : undefined} strokeWidth={ scaleMode === 'Y' ? 15 : 8} name={'stretch-y'} onPress={() => onScaleModeChange('Y')} />
            <MyDivider />
            <BbIcon size={18} marginLeft={0} marginBottom={2} name={'trash'} onPress={deleteSelected} />
            <MyDivider />
            <BbIcon size={18} marginLeft={5} marginBottom={2} name={'ok'} onPress={unselect} />

        </View>
    )
}

export default BoundaryBoxIcons;