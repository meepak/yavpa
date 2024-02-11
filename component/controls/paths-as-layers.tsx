import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { PathDataType } from "@u/helper";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import MyColorPicker from "./my-color-picker";
import ContextMenu from "./context-menu";
import StrokeWidth from "./stroke-width";

type OnValueChanged = (arg0: PathDataType[]) => void;

interface Props {
    value: PathDataType[];
    onValueChanged: OnValueChanged;
}

const PathsAsLayers: React.FC<Props> = ({ value, onValueChanged }) => {
    const [layers, setLayers] = useState<PathDataType[]>(value);
    const [selectedLayers, setSelectedLayers] = useState<PathDataType[]>([]);

    useEffect(() => {
        setLayers((value) =>
            value.map((layer) => {
                if (layer.guid === null || layer.guid === undefined || !layer.guid) {
                    layer.guid = Crypto.randomUUID();
                }
                if (layer.visible === undefined || layer.visible === null) {
                    layer.visible = true;
                }
                return layer;
            })
        );
    }, []);

    // In React, you should never directly mutate state. 
    // Instead, you should create a new copy of the state, 
    // modify that, and then call the state update function with the new state.
    function updateLayer(layer: PathDataType) {
        setLayers((prevLayers) => {
            const newLayers = [...prevLayers]; // Create a new copy of the layers array
            const index = newLayers.findIndex((l) => l.guid === layer.guid);
            if (index !== -1) {
                newLayers[index] = layer; // Modify the new copy, not the original state
            }
            onValueChanged(newLayers);
            return newLayers; // Return the new state
        });
    };

    // Operation on paths as individual layers

    // not sure the actual purpose of this
    function toggleSelectedLayer(layer: PathDataType) {
        const newSelectedLayers = selectedLayers.includes(layer)
            ? selectedLayers.filter((l) => l.guid !== layer.guid)
            : [...selectedLayers, layer];
        setSelectedLayers(() => newSelectedLayers);
    }

    // keep the path but hide/show it from the view
    function toggleLayerVisibility(layer: PathDataType) {
        const newLayer = { ...layer, visible: !layer.visible };
        updateLayer(newLayer);
    }

    // move the layer up or down, change the order they were drawn
    function moveLayer(upOrDown: string, index: number) {
        const newLayers = [...layers];
        const layer = newLayers.splice(index, 1)[0];
        newLayers.splice(upOrDown === "up" ? index - 1 : index + 1, 0, layer);
        setLayers(() => newLayers);
        onValueChanged(newLayers);
    }

    // remove the layer permanently
    function deleteLayer(index: number) {
        Alert.alert("Delete Path", "Are you sure you want to delete this path permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    const newLayers = [...layers];
                    newLayers.splice(index, 1);
                    setLayers(() => newLayers);
                    onValueChanged(newLayers);
                },
            },
        ]);
    }

    return (
        <View style={styles.container}>
            {[...layers].reverse().map((layer, idx) => {
                const index = layers.length - 1 - idx;
                return (
                    <View style={styles.row} key={layer.guid}>
                        {/* <TouchableOpacity style={styles.cell} onPress={() => toggleSelectedLayer(layer)}>
                            <Feather name={selectedLayers.includes(layer) ? "plus-square" : "square"} size={16} />
                        </TouchableOpacity> */}
                        <TouchableOpacity style={styles.cell} onPress={() => toggleLayerVisibility(layer)}>
                            <Feather name={layer.visible ? "eye" : "eye-off"} size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ ...styles.cell, width: 100 }}>
                            <ContextMenu anchor={<Text style={{ fontSize: 12, }}>{layer.stroke}</Text>} width={350} height={200}>
                                <MyColorPicker initialColor={layer.stroke} onColorSelected={(color) => updateLayer({ ...layer, stroke: color })} />
                            </ContextMenu>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell}>
                            <ContextMenu anchor={<Text style={{ fontSize: 12, }}>{layer.strokeWidth.toFixed(2).padStart(6)}</Text>} width={250} height={100}>
                                <StrokeWidth color={layer.stroke} value={layer.strokeWidth} onValueChanged={(value) => updateLayer({ ...layer, strokeWidth: value })} />
                            </ContextMenu>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => moveLayer("up", index)}>
                            <Feather name="arrow-up" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => moveLayer("down", index)}>
                            <Feather name="arrow-down" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cell} onPress={() => deleteLayer(index)}>
                            <Feather name="trash" size={16} />
                        </TouchableOpacity>
                    </View>
                )
            })}
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