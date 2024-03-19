import { ContextMenu, Divider } from "@c/controls";
import { View, Text, Pressable } from "react-native"
import Modal from "react-native-modal"
import * as Crypto from "expo-crypto"
import { useState } from "react";
import SelectBrushColor from "@c/controls/select-brush-color";
import { ModalAnimations } from "@u/types";
import MyIcon from "@c/my-icon";
import { getPointsFromPath } from "@u/helper";


const BoundaryBoxIcons = ({
    activeBoundaryBoxPath,
    setActiveBoundaryBoxPath,
    svgData,
    setSvgData,
}) => {
    const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
    
    type PathStyleType = {
        strokeWidth: number,
        stroke: string,
        strokeOpacity: number,s
        fill: string
    }
    const [styleClipBoard, setStyleClipBoard] = useState<PathStyleType|null>(null);


    const applyFill = (fill: string) => {
        setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    item.fill = fill;
                }
            });
            return {...prev, metaData: {...prev.metaData, updatedAt: ""}};
        });
        setActiveBoundaryBoxPath(null);
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
        if(styleClipBoard == null) return;
        setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    item.strokeWidth = styleClipBoard.strokeWidth;
                    item.stroke = styleClipBoard.stroke;
                    item.strokeOpacity = styleClipBoard.strokeOpacity;
                    item.fill = styleClipBoard.fill;
                }
            });
            return {...prev, metaData: {...prev.metaData, updatedAt: ""}};
        });
        setActiveBoundaryBoxPath(null);
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
            return {...prev, metaData: {...prev.metaData, updatedAt: ""}};
        });
        setActiveBoundaryBoxPath(null);
        close();
        console.log("duplicateSelected")
    }

    const deleteSelected = () => {
        setSvgData((prev) => {
            prev.pathData = prev.pathData.filter((item) => item.selected !== true);
            return {...prev, metaData: {...prev.metaData, updatedAt: ""}};
        });
        setActiveBoundaryBoxPath(null);
        close();
        console.log("deleteSelected")
    }


    const BbIcon = ({ name, onPress}) => {
        return (
        <MyIcon
        name={name}
        size={25}
        color={'#000'}
        onPress={onPress}
        />
    )};

    return (
        <Modal
            isVisible={menuPosition.x > 0 && menuPosition.y > 0}
            coverScreen={true}
            hasBackdrop={true}
            backdropOpacity={0.01}
            onBackdropPress={close}
            statusBarTranslucent={false}
            animationIn={ModalAnimations.zoomIn}
            animationOut={ModalAnimations.fadeOut}
            style={{margin: 10}}
            useNativeDriver
            useNativeDriverForBackdrop
        >
            <View style={{
                position: 'absolute',
                left: menuPosition.x,
                top: menuPosition.y,
                width: 150,
                height: 'auto',
                padding: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(150,150,250, 0.75)',
                borderWidth: 0.7,
                borderColor: "rgba(0,0,0,0.5)",
            }}>
                {/* {
                    activeBoundaryBoxPath &&
                     <ContextMenu
                    anchor= {<MenuItem height={25} text={'Fill'} onPress={()=>{}}/>}
                                width={140}
                                height={500}
                            >
                                <SelectBrushColor value={'#00FF00'} onValueChanged={(color: any) => applyFill(color)} />
                            </ContextMenu>
                } */}
                {
                    activeBoundaryBoxPath &&
                    <MenuItem height={25} text={'Duplicate'} onPress={duplicateSelected} />
                }
                {
                    activeBoundaryBoxPath &&
                    <MenuItem height={25} text={'Copy Style'} onPress={copyStyle} />
                }
                {
                    activeBoundaryBoxPath && styleClipBoard &&
                    <MenuItem height={25} text={'Apply Style'} onPress={pasteStyle} />
                }
                {
                    activeBoundaryBoxPath &&
                    <MenuItem height={25} text={'Delete'} onPress={deleteSelected} />
                }
            </View>
        </Modal >
    )
}

export default CanvasContextMenu;