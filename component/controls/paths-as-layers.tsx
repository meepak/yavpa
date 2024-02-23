import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback } from "react-native";
import { PathDataType, SvgDataType } from "@u/types";
import * as Crypto from "expo-crypto";

import { Feather } from '@expo/vector-icons';
import ContextMenu from "./context-menu";
import { SvgDataContext } from "@x/svg-data";
import { createSvgData, getViewBoxTrimmed, precise } from "@u/helper";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import Divider from "./divider";
import SelectBrushColor from "./select-brush-color";
import MyIcon from "@c/my-icon";
import StrokeWidthOpacity from "./stroke-width-opacity";
import MyPreview from "@c/my-preview";
import { path } from "d3";



const PathsAsLayers = (
    {svgData, setSvgData}: 
    {
        svgData: SvgDataType, 
        setSvgData:(value: React.SetStateAction<SvgDataType>) => {}
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
                        return { ...prevSvgData, pathData: newLayers };
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

    const pathToSvgData = (path: PathDataType): SvgDataType => {
        path.visible = true; //override for preview
        // path.strokeOpacity = 0.5; //override for preview
        return {
            ...createSvgData(),
            pathData: [path],
            metaData: {
                ...createSvgData().metaData,
                guid: Crypto.randomUUID(),
                viewBox: getViewBoxTrimmed([path]),
            }
        };
    }

    const renderItem = ({ item, drag, isActive }) => {
        const svgData = pathToSvgData(item);
        const width = precise(svgData.metaData.viewBox.split(' ')[2]);
        const height = precise(svgData.metaData.viewBox.split(' ')[3]);
        const maxPreviewSize = 50;
        const previewSize = (width > height)
            ? { width: maxPreviewSize, height: height * maxPreviewSize / width }
            : { width: width * maxPreviewSize / height, height: maxPreviewSize }

        return (
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
                            <TouchableOpacity style={styles.cell} onPress={() => deletePath(item)}>
                                <Feather name="trash" size={16} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ width: '30%' }}>
                            <TouchableOpacity style={styles.cell} onPress={() => console.log('need timer adjustment component')}>
                                <Text style={{...styles.cell, ...styles.link}}>T:&nbsp;{precise(item.time / 1000)}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ ...styles.cell, width: 100 }}>
                                <ContextMenu
                                    anchor={
                                        <Text style={{...styles.cell, ...styles.link}}>S:&nbsp;{cleanBrushName(item.stroke)}</Text>
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
                                            <Text style={{...styles.cell, ...styles.link}}>W:&nbsp;{precise(item.strokeWidth)}</Text>
                                            <Text style={{...styles.cell, ...styles.link}}>O:&nbsp;{precise(item.strokeOpacity)}</Text>
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
                                onLongPress={drag}>
                                <View style={{ ...styles.row, width: previewSize.width, height: previewSize.height, alignItems: 'flex-end' }}>
                                    <MyIcon name="drag" size={24} color={'rgba(0,0,0,0.5)'} fill={'rgba(0,0,0,0.4)'} />
                                    <MyPreview animate={false} data={svgData} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScaleDecorator>
        )
    };

    // If 85% causes any issue, remove sticky header and live with it getting scrolled up
    return (
        <TouchableWithoutFeedback>
            <View style={{ width: '100%', height: '85%' }}>
                <HeaderComponent />
                <DraggableFlatList
                    data={[...svgData.pathData].reverse()}
                    renderItem={renderItem}
                    keyExtractor={(item) => `draggable-item-${item.guid}`}
                    onDragEnd={(data) => setSvgData((prevSvgData: SvgDataType) => ({ ...prevSvgData, pathData: data.data.reverse() }))} // update the svgData.pathData with new order
                    ItemSeparatorComponent={ItemSeparator}
                // ListHeaderComponent={HeaderComponent}
                // stickyHeaderIndices={[0]}
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
    },
    link: {
        fontSize: 12,
        color: "blue",
        textDecorationLine: "underline",
    }
});
export default PathsAsLayers;