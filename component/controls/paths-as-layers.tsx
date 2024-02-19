import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { PathDataType, SvgDataType } from "@u/types";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import MyColorPicker from "./my-color-picker";
import ContextMenu from "./context-menu";
import StrokeWidth from "./stroke-width";
import { SvgDataContext } from "@x/svg-data";
import { ScrollView } from "react-native-gesture-handler";
import { precise } from "@u/helper";



const PathsAsLayers = () => {
    const {svgData, setSvgData} = useContext(SvgDataContext);


    function updateStroke(idx, stroke:string) {
        setSvgData((prevSvgData: SvgDataType) => {
            const newSvgData = { ...prevSvgData };
            newSvgData.pathData[idx].stroke = stroke;
            newSvgData.pathData[idx].guid = Crypto.randomUUID();
            return newSvgData;
        });
    }

    function updateStrokeWidth(idx, strokeWidth:number) {
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

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }}>
            {[...svgData.pathData].reverse().map((layer, idx) => {
                const index = svgData.pathData.length - 1 - idx;
                return (
                    <React.Fragment key={layer.guid}>
                    <View style={styles.row}>
                        {/* <TouchableOpacity style={styles.cell} onPress={() => toggleSelectedLayer(layer)}>
                            <Feather name={selectedLayers.includes(layer) ? "plus-square" : "square"} size={16} />
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.cell} onPress={() => toggleLayerVisibility(idx)}>
                            <Feather name={layer.visible ? "eye" : "eye-off"} size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...styles.cell, width: 100 }}>
                            <ContextMenu anchor={<Text style={{ fontSize: 12, }}>{layer.stroke}</Text>} width={350} height={200}>
                                <MyColorPicker initialColor={layer.stroke} onColorSelected={(color: any) => updateStroke( idx, color )} />
                            </ContextMenu>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell}>
                            <ContextMenu anchor={<Text style={{ fontSize: 12, }}>{layer.strokeWidth.toFixed(2).padStart(6)}</Text>} width={250} height={100}>
                                <StrokeWidth color={layer.stroke} value={layer.strokeWidth} onValueChanged={(value: any) => updateStrokeWidth(idx, value)} />
                            </ContextMenu>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => moveLayer("up", idx)}>
                            <Feather name="arrow-up" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => moveLayer("down", idx)}>
                            <Feather name="arrow-down" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => deleteLayer(index)}>
                            <Feather name="trash" size={16} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Length: {precise(layer.length)}</Text>
                        <Text style={styles.cell}>Time: {precise(layer.time)}</Text>
                    </View>
                    </React.Fragment>
                )
            })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: 'stretch', // Add this line
    },
    cell: {
        justifyContent: "center",
        alignItems: "center",
        padding: 7,
        borderWidth: 1,
        borderColor: "#ccc",
    },
});
export default PathsAsLayers;