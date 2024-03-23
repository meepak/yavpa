import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback } from "react-native";
import { CANVAS_WIDTH, MY_BLACK, PathDataType, SvgDataType } from "@u/types";
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
import { SvgDataContext } from "@x/svg-data";
import MyCheckBox from "@c/my-check-box";
import myConsole from "@c/my-console-log";



const PathsAsLayers = () => {
    const { svgData, setSvgData } = React.useContext(SvgDataContext);
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
                        return { metaData: { ...prevSvgData.metaData, updatedAt: "" }, pathData: newLayers };
                    });
                },
            },
        ]);
    }

    function deleteAllSelectedPath() {
        Alert.alert("Delete Path", "Are you sure you want to delete all selected paths permanently?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                onPress: () => {
                    // delete indexth element from svgData.pathData
                    setSvgData((prevSvgData: SvgDataType) => {
                        const newLayers = prevSvgData.pathData.filter((path) => !path.selected);
                        return { metaData: { ...prevSvgData.metaData, updatedAt: "" }, pathData: newLayers };
                    });
                },
            },
        ]);
    }

    function reversePaths() {
        setSvgData((prev: SvgDataType) => {
            const newLayers = prev.pathData.reverse();
            return { metaData: { ...prev.metaData, updatedAt: "" }, pathData: newLayers };
        });
    }

    const handlePathUpdate = (path: PathDataType, prop: any, value: any) => {
        if (path[prop] === value) return;
        const index = svgData.pathData.indexOf(path);

        setSvgData((prevSvgData: SvgDataType) => {
            const newLayers = [...prevSvgData.pathData];
            newLayers[index] = { ...path, [prop]: value };
            const metaData = prop === 'selected' ? prevSvgData.metaData : { ...prevSvgData.metaData, updatedAt: "" };
            return { metaData: metaData, pathData: newLayers };
        });
    }

    const [allSelected, setAllSelected] = useState(false);
    const toggleAllSelection = (checked: boolean) => {
        setAllSelected(checked);
        setSvgData((prevSvgData: SvgDataType) => {
            const newLayers = prevSvgData.pathData.map((path) => ({ ...path, selected: checked }));
            return { metaData: { ...prevSvgData.metaData, updatedAt: "" }, pathData: newLayers };
        });
    }

    const cleanBrushName = (brushName: string) => brushName.startsWith('url') ? brushName.slice(4, -1) : brushName;

    const ItemSeparator = () => <Divider width="100%" color="rgba(0,0,0,1)" height={2} />;

    const HeaderComponent = () =>
        <>

            <Text style={styles.cell1}>Total: {svgData.pathData.length} paths</Text>
            <View style={{...styles.row, width: '100%'}}>
                <MyCheckBox checked={allSelected} onChange={toggleAllSelection} label={""} checkBoxFirst iconStyle={{ color: 'transparent', size: 24, fill: '#000000' }} />

                <TouchableOpacity onPress={deleteAllSelectedPath}>
                    <MyIcon name="trash" size={20} color={MY_BLACK} />
                </TouchableOpacity>

                <TouchableOpacity onPress={reversePaths}>
                    <MyIcon name="sort" strokeWidth={2} size={28} color={MY_BLACK} style={{marginBottom: -2}} />
                </TouchableOpacity>

            </View>
            <Divider width="100%" color="rgba(1,1,1,0.7)" height={4} />

        </>;

    const pathToSvgData = (path: PathDataType): SvgDataType => {
        const newSvg = createSvgData();
        return {
            ...newSvg,
            pathData: [{ ...path, visible: true }],
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

        pathAsSvgData.pathData[0].strokeWidth = pathAsSvgData.pathData[0].strokeWidth * CANVAS_WIDTH / previewSize.width;
        return (
            <ScaleDecorator key={item.guid}>
                <View
                    style={{ ...styles.cell, width: 180, padding: 5, backgroundColor: isActive ? 'rgba(0,0,255,0.2)' : 'transparent' }}>

                    <View style={{...styles.row, height: 50}}>

                    <View style={{ ...styles.col, width: 120 }}>
                            <View style={styles.row}>


                                {/* <TouchableOpacity onPress={() => handlePathUpdate(item, "selected", !item.selected)}> */}
                                <MyCheckBox checked={svgData.pathData.every((item) => item.selected)} onChange={(checked) => handlePathUpdate(item, "selected", checked)} label="" iconStyle={{ color: 'transparent', size: 24, fill: '#000000'}}/>
                                     {/* <MyIcon name={item.selected ? "checkbox-checked" : "checkbox-empty"} color={MY_BLACK} size={20} /> */}
                                {/* </TouchableOpacity> */}

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

                            </View>

                            <View style={styles.row}>


                                <TouchableOpacity style={styles.cell}>
                                    <ContextMenu anchor=
                                        {
                                            <Text style={{ ...styles.cell, ...styles.link }}>Width:&nbsp;{precise(item.strokeWidth, 2)}</Text>
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

                                <TouchableOpacity onPress={() => handlePathUpdate(item, "visible", !item.visible)}>
                                    <Feather name={item.visible ? "eye" : "eye-off"} size={20} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.row}>
                                <TouchableOpacity onPress={() => deletePath(item)}>
                                    <MyIcon name="trash" size={20} color={MY_BLACK} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cell}>
                                    <ContextMenu anchor=
                                        {
                                            <Text style={{ ...styles.cell, ...styles.link }}>Opacity:&nbsp;{precise(item.strokeOpacity, 2)}</Text>
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
                        </View>

                    <View style={{ ...styles.col, width: 40, height: 50,}}>

                            <TouchableOpacity
                                onPress={drag}>
                                <View style={{
                                    width: 40,
                                    height: 50,
                                    backgroundColor:
                                    'rgba(0,0,0,0.1)'
                                    }}>
                                <View style={{
                                    width: previewSize.width,
                                    height: previewSize.height,
                                    zIndex: 0,
                                }}>
                                    <MyPreview animate={false} data={pathAsSvgData} />
                                </View>
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
            <View style={{ width: '100%', height: '90%' }}>
                <HeaderComponent />
                <DraggableFlatList
                    data={(JSON.parse(JSON.stringify(svgData.pathData))).reverse()}
                    renderItem={renderItem}
                    keyExtractor={(item) => `draggable-item-${item.guid}`}
                    onDragEnd={
                        (data) => {
                            if (data.from !== data.to) {
                                setSvgData(
                                    (prevSvgData: SvgDataType) => ({
                                        metaData: { ...prevSvgData.metaData, updatedAt: "" },
                                        pathData: data.data.reverse()
                                    })
                                ); // update the svgData.pathData with new order
                            }
                        }
                    }
                    ItemSeparatorComponent={ItemSeparator}
                    // ListHeaderComponent={HeaderComponent}
                    // stickyHeaderIndices={[0]}
                    contentContainerStyle={{ paddingVertical: 10}}
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
        width: 100,
        flexDirection: "row",
        alignItems: 'center', // Add this line
        justifyContent: "space-between",
        alignContent: "space-between",
    },
    col: {
        flexDirection: "column",
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        alignContent: "space-between",
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
        fontSize: 11,
        // borderWidth: 1,
        // borderColor: "#ccc",
    },
    th: {
        fontWeight: "bold",
        fontStyle: "italic",
    },
    link: {
        color: "blue",
        textDecorationLine: "underline",
    }
});
export default PathsAsLayers;
