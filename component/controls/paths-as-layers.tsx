import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback } from "react-native";
import { PathDataType, SvgDataType } from "@u/types";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import ContextMenu from "./context-menu";
import { SvgDataContext } from "@x/svg-data";
import { precise } from "@u/helper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Divider from "./divider";
import SelectBrushColor from "./select-brush-color";
import MyIcon from "@c/my-icon";
import StrokeWidthOpacity from "./stroke-width-opacity";



const PathsAsLayers = () => {
    const { svgData, setSvgData } = useContext(SvgDataContext);



    // function updateVisiblity(item: PathDataType) {
    //     const index = svgData.pathData.indexOf(item);
    //     item.visible = !item.visible;
    //     item.guid = Crypto.randomUUID();
    //     setSvgData((prevSvgData: SvgDataType) => {
    //         const newSvgData = { ...prevSvgData };
    //         newSvgData.pathData[index] = item
    //         return newSvgData;
    //     });
    // }

    // function updateStrokeWidth(idx, strokeWidth: number) {
    //     setSvgData((prevSvgData: SvgDataType) => {
    //         const newSvgData = { ...prevSvgData };
    //         newSvgData.pathData[idx].strokeWidth = strokeWidth;
    //         newSvgData.pathData[idx].guid = Crypto.randomUUID();
    //         return newSvgData;
    //     });
    // }

    // Operation on paths as individual layers

    // not sure the actual purpose of this
    // function toggleSelectedLayer(layer: PathDataType) {
    //     const newSelectedLayers = selectedLayers.includes(layer)
    //         ? selectedLayers.filter((l) => l.guid !== layer.guid)
    //         : [...selectedLayers, layer];
    //     setSelectedLayers(() => newSelectedLayers);
    // }

    // // keep the path but hide/show it from the view
    // function toggleLayerVisibility(item: PathDataType) {
    //         const index = svgData.pathData.indexOf(item);
    //         item.visible = !item.visible;
    //         console.log('toggleLayerVisibility', index, item);
    //     setSvgData((prevSvgData: any) => {
    //         prevSvgData.pathData[index] = {...item};
    //         return prevSvgData;
    //     });
    // }


    //  swap the index element in svgData.pathData with up or down element
    // function moveLayer(upOrDown: string, index: number) {
    //     const newLayers = [...svgData.pathData];
    //     if (upOrDown === "up") {
    //         if (index > 0) {
    //             [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
    //         }
    //     } else {
    //         if (index < newLayers.length - 1) {
    //             [newLayers[index + 1], newLayers[index]] = [newLayers[index], newLayers[index + 1]];
    //         }
    //     }
    //     setSvgData((prevSvgData: SvgDataType) => ({ ...prevSvgData, pathData: newLayers }));
    // }

    // remove the layer permanently
    function deleteLayer(item: PathDataType) {
        Alert.alert("Delete Path", "Are you sure you want to delete this path permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    // delete indexth element from svgData.pathData
                    setSvgData((prevSvgData: SvgDataType) => {
                        const newLayers = prevSvgData.pathData.filter((path) => path !== item);
                        return { ...prevSvgData, pathData: newLayers };
                      });
                },
            },
        ]);
    }


    // function updateStroke(path: PathDataType,  stroke: string) {
    //         if(path.stroke === stroke) return;
    //     const index = svgData.pathData.indexOf(path);
    //     setSvgData((prevSvgData: SvgDataType) => {
    //         const newSvgData = { ...prevSvgData };
    //         newSvgData.pathData[index].stroke = stroke;
    //         newSvgData.pathData[index].guid = Crypto.randomUUID();
    //         return newSvgData;
    //     });
    // }


    const handlePathUpdate = (path: PathDataType, prop: any, value: any) => {
        if (path[prop] === value) return;
        const index = svgData.pathData.indexOf(path);

        setSvgData((prevSvgData: SvgDataType) => { 
            const newLayers = [...prevSvgData.pathData];
            newLayers[index] = { ...path, [prop]: value, guid: Crypto.randomUUID() };
            return { ...prevSvgData, pathData: newLayers };
        });
    }

    const cleanBrushName = (brushName: string) => brushName.startsWith('url') ? brushName.slice(4, -1) : brushName;
    const ItemSeparator = () => <Divider width="100%" color="rgba(0,0,0,1)" height={2} />;
    const HeaderComponent = () =>
        <>
            <View style={styles.column}>
                <Text style={styles.cell1}>Total paths: {svgData.pathData.length}</Text>
                <Text style={styles.cell1}>Drawing Time: {svgData.pathData.reduce((sum, item) => sum + item.time, 0) / 1000} secs</Text>
            </View>
            <Divider width="100%" color="rgba(1,1,1,0.7)" height={4} />

        </>;

    const renderItem = ({ item, drag, isActive }) => (
        <ScaleDecorator key={item.guid}>
            <View
                style={{ ...styles.cell, backgroundColor: isActive ? 'rgba(0,0,255,0.2)' : '' }}>
                <View style={styles.row}>
                    <View style={{ width: '10%' }}>
                        <TouchableOpacity style={styles.cell} onPress={() => handlePathUpdate(item, "visible", !item.visible)}>
                            <Feather name={item.visible ? "eye" : "eye-off"} size={16} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '10%' }}>
                        <TouchableOpacity style={styles.cell} onPress={() => deleteLayer(item)}>
                            <Feather name="trash" size={16} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '30%' }}>
                        <TouchableOpacity style={styles.cell} onPress={() => console.log('need timer adjustment component')}>
                            <Text style={styles.cell}>T:&nbsp;{precise(item.time / 1000)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ ...styles.cell, width: 100 }}>
                            <ContextMenu
                                anchor={
                                    <Text style={{ fontSize: 12, }}>S:&nbsp;{cleanBrushName(item.stroke)}</Text>
                                }
                                width={340}
                                height={360}
                            >
                                <SelectBrushColor value={item.stroke} onValueChanged={(color: any) => handlePathUpdate(item, "stroke", color)} />
                            </ContextMenu>
                        </TouchableOpacity>
                    </View>


                    <View style={{ width: '30%' }}>
                        <TouchableOpacity style={styles.cell}>
                            <ContextMenu anchor=
                                {
                                    <>
                                        <Text style={{ fontSize: 12, }}>W:&nbsp;{precise(item.strokeWidth)}</Text>
                                        <Text style={{ fontSize: 12, }}>O:&nbsp;{precise(item.strokeOpacity)}</Text>
                                    </>
                                }
                                width={250}
                                height={200}
                            >
                                <StrokeWidthOpacity
                                    color={item.stroke}
                                    width={item.strokeWidth}
                                    opacity={item.strokeOpacity}
                                    onWidthChanged={(value: any) => handlePathUpdate(item, "strokeWidth", value)}
                                    onOpacityChanged={(value: any) => handlePathUpdate(item, "strokeOpacity", value)}
                                />
                            </ContextMenu>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '10%' }}>
                        <TouchableOpacity
                            style={{ width: 48 }}
                            onPressIn={drag}>
                            <View style={{ ...styles.row, width: 48, alignItems: 'flex-end' }}>
                                <MyIcon name="drag" size={24} color={'rgba(0,0,0,0.5)'} fill={'rgba(0,0,0,0.4)'} />
                                <MyIcon name="drag" size={24} color={'rgba(0,0,0,0.5)'} fill={'rgba(0,0,0,0.4)'} style={{ marginLeft: -5 }} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScaleDecorator>
    );

    return (
        <TouchableWithoutFeedback>
            <View style={{ width: '100%', height: '100%' }}>
                <DraggableFlatList
                    data={[...svgData.pathData].reverse()}
                    renderItem={renderItem}
                    keyExtractor={(item) => `draggable-item-${item.guid}`}
                    onDragEnd={(data) => setSvgData((prevSvgData: SvgDataType) => ({ ...prevSvgData, pathData: data.data.reverse() }))} // update the svgData.pathData with new order
                    ItemSeparatorComponent={ItemSeparator}
                    ListHeaderComponent={HeaderComponent}

                />

            </View>
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
    cell1: {
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
    },
    cell: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: 1,
        // borderWidth: 1,
        // borderColor: "#ccc",
    },
    column: {
        flexDirection: "column",
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    th: {
        fontWeight: "bold",
        fontStyle: "italic",
    }
});
export default PathsAsLayers;