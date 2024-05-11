import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import {
  CANVAS_WIDTH,
  MY_BLACK,
  type PathDataType,
  type MyPathDataType,
  CANVAS_HEIGHT,
} from "@u/types";
import * as Crypto from "expo-crypto";
import { Feather } from "@expo/vector-icons";
import {
  createMyPathData,
  getPathLength,
  getPointsFromPath,
  getViewBoxTrimmed,
  precise,
} from "@u/helper";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import MyIcon from "@c/controls/pure/my-icon";
import MyPreview from "@c/controls/my-preview";
import { useMyPathDataContext } from "@x/svg-data";
import MyCheckBox from "@c/controls/pure/my-check-box";
import myConsole from "@c/controls/pure/my-console-log";
import StrokeOpacity from "./stroke-opacity";
import StrokeWidth from "./stroke-width";
import SelectBrushColor from "./select-brush-color";
import Divider from "./pure/divider";
import ContextMenu from "./pure/context-menu";

const PathsAsLayersDraw = () => {
  const { myPathData, setMyPathData } = React.useMyPathDataContext();

  // Remove the path permanently
  function deletePath(item: PathDataType) {
    Alert.alert(
      "Delete Path",
      "Are you sure you want to delete this path permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress() {
            // Delete indexth element from myPathData.pathData
            setMyPathData((previousMyPathData: MyPathDataType) => {
              const newLayers = previousMyPathData.pathData.filter(
                (path) => path !== item,
              );
              return {
                ...previousMyPathData,
                metaData: { ...previousMyPathData.metaData, updatedAt: "" },
                pathData: newLayers,
              };
            });
          },
        },
      ],
    );
  }

  function deleteAllSelectedPath() {
    Alert.alert(
      "Delete Path",
      "Are you sure you want to delete all selected paths permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress() {
            // Delete indexth element from myPathData.pathData
            setMyPathData((previousMyPathData: MyPathDataType) => {
              const newLayers = previousMyPathData.pathData.filter(
                (path) => !path.selected,
              );
              return {
                ...previousMyPathData,
                metaData: { ...previousMyPathData.metaData, updatedAt: "" },
                pathData: newLayers,
              };
            });
          },
        },
      ],
    );
  }

  function combineAllSelectedPaths() {
    Alert.alert(
      "Combine Paths",
      "Are you sure you want to combine all selected paths into one?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Combine",
          onPress() {
            // Delete indexth element from myPathData.pathData
            setMyPathData((previousMyPathData: MyPathDataType) => {
              const selectedPaths = [...previousMyPathData.pathData].filter(
                (path) => path.selected,
              );
              const unselectedPaths = [...previousMyPathData.pathData].filter(
                (path) => !path.selected,
              );

              let totalTime = 0;
              if (selectedPaths.length > 0) {
                const combinedPath = selectedPaths.reduce(
                  (combined, current, index) => {
                    totalTime += current.time;
                    if (index === 0) {
                      return current.path;
                    }

                    const match = /m\s*([-\d.]+)\s*,?\s*([-\d.]+)/i.exec(
                      current.path,
                    );
                    if (match) {
                      const [, x, y] = match;
                      return `${combined} M ${x} ${y} ${current.path.slice(match[0].length)}`;
                    }

                    // Handle the case where the match fails, if necessary
                    return combined;
                  },
                  "",
                );

                // We can also try just merging points
                const combinedPoints = getPointsFromPath(combinedPath);

                // Get new path length
                const length = getPathLength(combinedPoints);

                const upath = {
                  ...selectedPaths[0],
                  path: combinedPath,
                  points: combinedPoints,
                  length,
                  time: totalTime,
                };

                unselectedPaths.push(upath);
              }

              return {
                ...previousMyPathData,
                metaData: { ...previousMyPathData.metaData, updatedAt: "" },
                pathData: unselectedPaths,
                updatedAt: new Date().toISOString(),
              };
            });
          },
        },
      ],
    );
  }

  function reversePaths() {
    setMyPathData((previous: MyPathDataType) => {
      const newLayers = previous.pathData.reverse();
      return {
        ...previous,
        metaData: { ...previous.metaData, updatedAt: "" },
        pathData: newLayers,
      };
    });
  }

  function deleteImage() {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress() {
            setMyPathData((previousMyPathData: MyPathDataType) => ({
              ...previousMyPathData,
              metaData: { ...previousMyPathData.metaData, updatedAt: "" },
              imageData: [],
            }));
          },
        },
      ],
    );
  }

  const handlePathUpdate = (path: PathDataType, property: any, value: any) => {
    setMyPathData((previousMyPathData: MyPathDataType) => {
      const newLayers = [...previousMyPathData.pathData].map((p) => {
        if (path.guid === p.guid) {
          return { ...p, [property]: value };
        }

        return { ...p };
      });
      const newMeta = {
        ...previousMyPathData.metaData,
        updatedAt: property === "selected" ? new Date().toISOString() : "",
      };
      return {
        ...previousMyPathData,
        metaData: newMeta,
        pathData: newLayers,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const [allSelected, setAllSelected] = useState(false);
  const toggleAllSelection = (checked: boolean) => {
    setAllSelected(checked);
    setMyPathData((previousMyPathData: MyPathDataType) => {
      const newLayers = previousMyPathData.pathData.map((path) => ({
        ...path,
        selected: checked,
      }));
      return {
        ...previousMyPathData,
        metaData: { ...previousMyPathData.metaData, updatedAt: "" },
        pathData: newLayers,
      };
    });
  };

  const cleanBrushName = (brushName: string) =>
    brushName.startsWith("url") ? brushName.slice(4, -1) : brushName;

  const ItemSeparator = () => (
    <Divider width="100%" color="rgba(0,0,0,1)" height={2} />
  );

  const HeaderComponent = () => (
    <>
      <Text style={styles.cell1}>
        Total: {myPathData.pathData.length} paths
      </Text>
      <View style={{ ...styles.row, width: "100%" }}>
        <MyCheckBox
          checked={allSelected}
          onChange={toggleAllSelection}
          label={""}
          checkBoxFirst
          iconStyle={{ color: "transparent", size: 24, fill: "#000000" }}
        />

        <TouchableOpacity onPress={deleteAllSelectedPath}>
          <MyIcon name="trash" size={20} color={MY_BLACK} />
        </TouchableOpacity>

        <TouchableOpacity onPress={reversePaths}>
          <MyIcon
            name="sort"
            strokeWidth={2}
            size={28}
            color={MY_BLACK}
            style={{ marginBottom: -2 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={combineAllSelectedPaths}>
          <MyIcon
            name="combine"
            strokeWidth={0.7}
            size={22}
            color={MY_BLACK}
            style={{ marginBottom: -2 }}
          />
        </TouchableOpacity>

        {myPathData.imageData && myPathData.imageData.length > 0 && (
          <TouchableOpacity onPress={deleteImage}>
            <MyIcon
              name="del-image"
              size={20}
              strokeWidth={2}
              color={MY_BLACK}
            />
          </TouchableOpacity>
        )}
      </View>
      <Divider width="100%" color="rgba(1,1,1,0.7)" height={4} />
    </>
  );

  const pathToMyPathData = (path: PathDataType): MyPathDataType => {
    const newSvg = createMyPathData();
    return {
      ...newSvg,
      pathData: [{ ...path, visible: true }],
      metaData: {
        ...newSvg.metaData,
        guid: path.guid, // Since each path going to its own svg it s fine to reuse them
      },
    };
  };

  const renderItem = ({ item, drag, isActive }) => {
    const pathAsMyPathData = pathToMyPathData(item);
    const width = precise(
      pathAsMyPathData.metaData.canvasWidth *
        pathAsMyPathData.metaData.canvasScale,
    );
    console.log(
      "width:",
      pathAsMyPathData.metaData.canvasWidth,
      "height:",
      pathAsMyPathData.metaData.canvasHeight,
      "scale:",
      pathAsMyPathData.metaData.canvasScale,
      "translateX:",
      pathAsMyPathData.metaData.canvasTranslateX,
      "translateY:",
      pathAsMyPathData.metaData.canvasTranslateY,
    );
    const height = precise(
      pathAsMyPathData.metaData.canvasHeight *
        pathAsMyPathData.metaData.canvasScale,
    );
    const maxPreviewSize = 44;
    const previewSize =
      width > height
        ? { width: maxPreviewSize, height: (height * maxPreviewSize) / width }
        : { width: (width * maxPreviewSize) / height, height: maxPreviewSize };

    pathAsMyPathData.pathData[0].strokeWidth =
      (pathAsMyPathData.pathData[0].strokeWidth * 0.2 * CANVAS_HEIGHT) /
      previewSize.height;
    return (
      <ScaleDecorator key={item.guid}>
        <View
          style={{
            ...styles.cell,
            width: 180,
            padding: 5,
            backgroundColor: isActive ? "rgba(0,0,255,0.2)" : "transparent",
          }}
        >
          <View style={{ ...styles.row, height: 50 }}>
            <View style={{ ...styles.col, width: 120 }}>
              <View style={styles.row}>
                {/* <TouchableOpacity onPress={() => handlePathUpdate(item, "selected", !item.selected)}> */}
                <MyCheckBox
                  checked={item.selected}
                  onChange={(checked) =>
                    item.selected !== checked &&
                    handlePathUpdate(item, "selected", checked)
                  }
                  label=""
                  iconStyle={{
                    color: "transparent",
                    size: 24,
                    fill: "#000000",
                  }}
                />
                {/* <MyIcon name={item.selected ? "checkbox-checked" : "checkbox-empty"} color={MY_BLACK} size={20} /> */}
                {/* </TouchableOpacity> */}

                <TouchableOpacity style={{ ...styles.cell }}>
                  <ContextMenu
                    anchor={
                      <Text style={{ ...styles.cell, ...styles.link }}>
                        {cleanBrushName(item.stroke)}
                      </Text>
                    }
                    width={140}
                    height={500}
                  >
                    <SelectBrushColor
                      value={item.stroke}
                      onValueChanged={(color: any) => {
                        handlePathUpdate(item, "stroke", color);
                      }}
                    />
                  </ContextMenu>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity style={styles.cell}>
                  <ContextMenu
                    anchor={
                      <Text style={{ ...styles.cell, ...styles.link }}>
                        Width:&nbsp;{precise(item.strokeWidth, 2)}
                      </Text>
                    }
                    width={100}
                    height={400}
                  >
                    <StrokeWidth
                      stroke={item.stroke}
                      value={item.strokeWidth}
                      strokeOpacity={item.strokeOpacity}
                      onValueChanged={(value: any) => {
                        handlePathUpdate(item, "strokeWidth", value);
                      }}
                    />
                  </ContextMenu>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handlePathUpdate(item, "visible", !item.visible);
                  }}
                >
                  <Feather name={item.visible ? "eye" : "eye-off"} size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    deletePath(item);
                  }}
                >
                  <MyIcon name="trash" size={20} color={MY_BLACK} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.cell}>
                  <ContextMenu
                    anchor={
                      <Text style={{ ...styles.cell, ...styles.link }}>
                        Opacity:&nbsp;{precise(item.strokeOpacity, 2)}
                      </Text>
                    }
                    width={100}
                    height={400}
                  >
                    <StrokeOpacity
                      stroke={item.stroke}
                      strokeWidth={item.strokeWidth}
                      value={item.strokeWidth}
                      onValueChanged={(value: any) => {
                        handlePathUpdate(item, "strokeOpacity", value);
                      }}
                    />
                  </ContextMenu>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ ...styles.col, width: 40, height: 50 }}>
              <TouchableOpacity onPress={drag}>
                <View
                  style={{
                    width: 40,
                    height: 50,
                    backgroundColor: "rgba(0,0,0,0.1)",
                  }}
                >
                  <View
                    style={{
                      width: previewSize.width,
                      height: previewSize.height,
                      zIndex: 0,
                    }}
                  >
                    <MyPreview animate={false} data={pathAsMyPathData} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  // If 85% causes any issue, remove sticky header and live with it getting scrolled up
  return (
    <TouchableWithoutFeedback>
      <View style={{ width: "100%", height: "90%" }}>
        <HeaderComponent />
        <DraggableFlatList
          data={JSON.parse(JSON.stringify(myPathData.pathData))} // MUST DO ELSE IT WILL HOLD THE OBJECT AND WON'T LET IT CHANGE ANYWHERE
          renderItem={renderItem}
          keyExtractor={(item) => `draggable-item-${item.guid}`}
          onDragEnd={(data) => {
            if (data.from !== data.to) {
              setMyPathData((previousMyPathData: MyPathDataType) => {
                const newData = [...previousMyPathData.pathData];
                const movedItem = newData.splice(data.from, 1)[0];
                newData.splice(data.to, 0, movedItem);
                return {
                  ...previousMyPathData,
                  metaData: { ...previousMyPathData.metaData, updatedAt: "" },
                  pathData: newData,
                };
              });
            }
          }}
          ItemSeparatorComponent={ItemSeparator}
          // ListHeaderComponent={HeaderComponent}
          // stickyHeaderIndices={[0]}
          contentContainerStyle={{ paddingVertical: 10 }}
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
    alignItems: "center", // Add this line
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  col: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    // BorderWidth: 1,
    // borderColor: "#ccc",
  },
  th: {
    fontWeight: "bold",
    fontStyle: "italic",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
export default PathsAsLayersDraw;
