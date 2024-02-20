import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback } from "react-native";
import { PathDataType, SvgDataType } from "@u/types";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import MyColorPicker from "./my-color-picker";
import ContextMenu from "./context-menu";
import StrokeWidth from "./stroke-width";
import { SvgDataContext } from "@x/svg-data";
import { precise } from "@u/helper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Divider from "./divider";
import SelectBrushColor from "./select-brush-color";



const PathsAsLayers = () => {
    const { svgData, setSvgData } = useContext(SvgDataContext);


    function updateStroke(idx, stroke: string) {
        setSvgData((prevSvgData: SvgDataType) => {
            const newSvgData = { ...prevSvgData };
            newSvgData.pathData[idx].stroke = stroke;
            newSvgData.pathData[idx].guid = Crypto.randomUUID();
            return newSvgData;
        });
    }

    function updateStrokeWidth(idx, strokeWidth: number) {
        setSvgData((prevSvgData: SvgDataType) => {
            const newSvgData = { ...prevSvgData };
            newSvgData.pathData[idx].strokeWidth = strokeWidth;
            newSvgData.pathData[idx].guid = Crypto.randomUUID();
            return newSvgData;
        });
    }

    // Operation on paths as individual layers

    // not sure the actual purpose of this
    // function toggleSelectedLayer(layer: PathDataType) {
    //     const newSelectedLayers = selectedLayers.includes(layer)
    //         ? selectedLayers.filter((l) => l.guid !== layer.guid)
    //         : [...selectedLayers, layer];
    //     setSelectedLayers(() => newSelectedLayers);
    // }

    // keep the path but hide/show it from the view
    function toggleLayerVisibility(index: number) {
        setSvgData((prevSvgData: any) => {
            const newSvgData = { ...prevSvgData };
            newSvgData.pathData[index].visible = !newSvgData.pathData[index].visible;
            return newSvgData;
        });
    }

    //  swap the index element in svgData.pathData with up or down element
    function moveLayer(upOrDown: string, index: number) {
        const newLayers = [...svgData.pathData];
        if (upOrDown === "up") {
            if (index > 0) {
                [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
            }
        } else {
            if (index < newLayers.length - 1) {
                [newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
            }
        }
        setSvgData((prevSvgData: SvgDataType) => ({ ...prevSvgData, pathData: newLayers }));
    }

    // remove the layer permanently
    function deleteLayer(index: number) {
        Alert.alert("Delete Path", "Are you sure you want to delete this path permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    // delete indexth element from svgData.pathData
                    const newLayers = svgData.pathData.filter((l: any, idx: number) => idx !== index);
                    setSvgData((prevSvgData: SvgDataType) => ({ ...prevSvgData, pathData: newLayers }));
                },
            },
        ]);
    }


    const renderItem = ({ item, drag, isActive }) => (
        <ScaleDecorator key={item.guid}>
            <TouchableOpacity
                style={{ ...styles.cell, backgroundColor: isActive ? 'rgba(0,0,255,0.2)' : '' }}
                onLongPress={drag}>
                <View style={styles.row}>
                    <TouchableOpacity style={styles.cell} onPress={() => toggleLayerVisibility(1)}>
                        <Feather name={item.visible ? "eye" : "eye-off"} size={16} />
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <Feather name="menu" size={22} />

                    <TouchableOpacity style={styles.cell} onPress={() => console.log('need timer adjustment component')}>
                        <Text style={styles.cell}>Time: {precise(item.time / 1000)} secs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ ...styles.cell, width: 100 }}>
                        <ContextMenu
                            anchor={
                                <Text style={{ fontSize: 12, }}>Stroke: {item.stroke}</Text>
                            }
                            width={340}
                            height={360}
                        >
                            <SelectBrushColor value={item.stroke} onValueChanged={(color: any) => updateStroke(1, color)} />
                        </ContextMenu>
                    </TouchableOpacity>

                    {/* <TouchableOpacity style={styles.cell}>
                        <ContextMenu anchor={<Text style={{ fontSize: 12, }}>{item.strokeWidth.toFixed(2).padStart(6)}</Text>} width={250} height={100}>
                            <StrokeWidth color={item.stroke} value={item.strokeWidth} onValueChanged={(value: any) => updateStrokeWidth(1, value)} />
                        </ContextMenu>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cell} onPress={() => deleteLayer(1)}>
                        <Feather name="trash" size={16} />
                    </TouchableOpacity> */}
                </View>
            </TouchableOpacity>
            <Divider width="100%" color="rgba(0,0,0,1)" height={3} />
        </ScaleDecorator>
    );

    return (
        <TouchableWithoutFeedback>
            <DraggableFlatList
                data={svgData.pathData}
                renderItem={renderItem}
                keyExtractor={(item) => `draggable-item-${item.guid}`}
                onDragEnd={(data) => console.log(data.from, data.to)}
            />
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ff0",
    },
    row: {
        flexDirection: "row",
        // alignItems: 'stretch', // Add this line
        justifyContent: "center",
        alignContent: 'flex-start',
        alignItems: "center",
    },
    cell: {
        justifyContent: "center",
        alignItems: "center",
        padding: 7,
        // borderWidth: 1,
        // borderColor: "#ccc",
    },
});
export default PathsAsLayers;