import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback } from "react-native";
import { PathDataType, SvgDataType } from "@u/types";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import ContextMenu from "./context-menu";
import { createSvgData, getViewBoxTrimmed, precise } from "@u/helper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Divider from "./divider";
import SelectBrushColor from "./select-brush-color";
import MyIcon from "@c/my-icon";
import StrokeWidth from "./stroke-width";
import MyPreview from "@c/my-preview";
import StrokeOpacity from "./stroke-opacity";



const PathsAsLayers = (
    { svgData, setSvgData }:
        {
            svgData: SvgDataType,
            setSvgData: (value: React.SetStateAction<SvgDataType>) => {}
        }) => {

    // remove the path permanently
    function deletePath(item: PathDataType) {
        Alert.alert("Delete Path", "Are you sure you want to delete this path permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    // delete indexth element from svgData.pathData
                    setSvgData((prevSvgData: SvgDataType) => {
                        const newLayers = prevSvgData.pathData.filter((path) => path !== item);
                        return { metaData: { ...prevSvgData.metaData, updated_at: "" }, pathData: newLayers };
                    });
                },
            },
        ]);
    }

    const handlePathUpdate = (path: PathDataType, prop: any, value: any) => {
        if (path[prop] === value) return;
        const index = svgData.pathData.indexOf(path);

        setSvgData((prevSvgData: SvgDataType) => {
            const newLayers = [...prevSvgData.pathData];
            newLayers[index] = { ...path, [prop]: value };
            const metaData = prop === 'selected' ? prevSvgData.metaData : { ...prevSvgData.metaData, updated_at: "" };
            return { metaData: metaData, pathData: newLayers };
        });
    }

    const cleanBrushName = (brushName: string) => brushName.startsWith('url') ? brushName.slice(4, -1) : brushName;

    const ItemSeparator = () => <Divider width="100%" color="rgba(0,0,0,1)" height={2} />;

    const HeaderComponent = () =>
        <>
            <View style={styles.col}>
                <Text style={styles.cell1}>Total Paths: {svgData.pathData.length}</Text>
                {/* <Text style={styles.cell1}>Time: {precise(svgData.pathData.reduce((sum, item) => sum + item.time, 0) / 1000, 0)} secs</Text> */}
            </View>
            <Divider width="100%" color="rgba(1,1,1,0.7)" height={4} />

        </>;

    const pathToSvgData = (path: PathDataType): SvgDataType => {
        return {
            ...createSvgData(),
            pathData: [{ ...path, visible: true }],
            metaData: {
                ...createSvgData().metaData,
                guid: Crypto.randomUUID(),
                viewBox: getViewBoxTrimmed([path]), // this is going to make
                // disproportionally larger to smaller paths, try another strategy
            }
        };
    }

    const renderItem = ({ item, drag, isActive }) => {
        const pathAsSvgData = pathToSvgData(item);
        const width = precise(pathAsSvgData.metaData.viewBox.split(' ')[2]);
        const height = precise(pathAsSvgData.metaData.viewBox.split(' ')[3]);
        const maxPreviewSize = 44;
        const previewSize = (width > height)
            ? { width: maxPreviewSize, height: height * maxPreviewSize / width }
            : { width: width * maxPreviewSize / height, height: maxPreviewSize }


        return (
            <ScaleDecorator key={item.guid}>
                <View
                    style={{ ...styles.cell, padding: 5, backgroundColor: isActive ? 'rgba(0,0,255,0.2)' : 'transparent' }}>


                    <View style={styles.row}>


                        <TouchableOpacity onPress={() => handlePathUpdate(item, "selected", !item.selected)}>
                            <MyIcon name={item.selected ? "checkbox-checked" : "checkbox-empty"} color='#000000' size={16} />
                        </TouchableOpacity>

                        <TouchableOpacity style={{ ...styles.cell }}>
                            <ContextMenu
                                anchor={
                                    <Text style={{ ...styles.cell, ...styles.link }}>{cleanBrushName(item.stroke)}</Text>
                                }
                                width={140}
                                height={500}
                            >
                                <SelectBrushColor value={item.stroke} onValueChanged={(color: any) => handlePathUpdate(item, "stroke", color)} />
                            </ContextMenu>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handlePathUpdate(item, "visible", !item.visible)}>
                            <Feather name={item.visible ? "eye" : "eye-off"} size={16} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deletePath(item)}>
                            <Feather name="trash" size={16} />
                        </TouchableOpacity>
                    </View>


                    <View style={styles.row}>
                        <View style={styles.col}>
                            <TouchableOpacity style={styles.cell}>
                                <ContextMenu anchor=
                                    {
                                        <Text style={{ ...styles.cell, ...styles.link }}>W:&nbsp;{precise(item.strokeWidth, 2)}</Text>
                                    }
                                    width={100}
                                    height={400}
                                >
                                    <StrokeWidth
                                        stroke={item.stroke}
                                        value={item.strokeWidth}
                                        strokeOpacity={item.strokeOpacity}
                                        onValueChanged={(value: any) => handlePathUpdate(item, "strokeWidth", value)}
                                    />
                                </ContextMenu>
                            </TouchableOpacity>


                            <TouchableOpacity style={styles.cell}>
                                <ContextMenu anchor=
                                    {
                                        <Text style={{ ...styles.cell, ...styles.link }}>O:&nbsp;{precise(item.strokeOpacity, 2)}</Text>
                                    }
                                    width={100}
                                    height={400}
                                >
                                    <StrokeOpacity
                                        stroke={item.stroke}
                                        strokeWidth={item.strokeWidth}
                                        value={item.strokeWidth}
                                        onValueChanged={(value: any) => handlePathUpdate(item, "strokeOpacity", value)}
                                    />
                                </ContextMenu>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={drag}>
                            <View style={{
                                width: previewSize.width,
                                height: previewSize.height,
                                position: 'absolute',
                                top: -25,
                                right: 15,
                                zIndex: 0,
                                backgroundColor: 'rgba(0,0,0,0.1)'
                            }}>
                                <MyPreview animate={false} data={pathAsSvgData} />
                            </View>

                            <View style={{ position: 'absolute', bottom: -20, right: -7 }}>
                                <MyIcon
                                    name="drag"
                                    size={24}
                                    color={'rgba(0,0,0,0.5)'}
                                    fill={'rgba(0,0,0,0.4)'}
                                />
                            </View>
                        </TouchableOpacity>


                    </View>
                </View>
            </ScaleDecorator>
        )
    };

    // If 85% causes any issue, remove sticky header and live with it getting scrolled up
    return (
        <TouchableWithoutFeedback>
            <View style={{ width: '100%', height: '90%' }}>
                <HeaderComponent />
                <DraggableFlatList
                    data={[...svgData.pathData].reverse()}
                    renderItem={renderItem}
                    keyExtractor={(item) => `draggable-item-${item.guid}`}
                    onDragEnd={
                        (data) => setSvgData(
                            (prevSvgData: SvgDataType) => ({
                                metaData: { ...prevSvgData.metaData, updated_at: "" },
                                pathData: data.data.reverse()
                            })
                        )} // update the svgData.pathData with new order
                    ItemSeparatorComponent={ItemSeparator}
                    // ListHeaderComponent={HeaderComponent}
                    // stickyHeaderIndices={[0]}
                    onAnimValInit={(val) => console.log(val)}

                />

            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffff00",
    },
    row: {
        width: 105,
        flexDirection: "row",
        alignItems: 'center', // Add this line
        justifyContent: "space-between",
    },
    col: {
        flexDirection: "column",
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
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
    th: {
        fontWeight: "bold",
        fontStyle: "italic",
    },
    link: {
        fontSize: 10,
        color: "blue",
        textDecorationLine: "underline",
    }
});
export default PathsAsLayers;