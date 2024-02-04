import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // or any other icon library you prefer
import ContextMenu from "@c/controls/context-menu";

const BUTTON_HEIGHT = 42;
const ICON_SIZE = 28;

const ControlPanel = ({ buttons, paddingLeft=40, paddingRight=20 }) => {

  const [closeMenuAt, setCloseMenuAt] = useState(Date.now());

  const hideMenu = () => setCloseMenuAt(Date.now());

  const onButtonPress = (item: {
    onPress: () => void;
    icon: string;
    extraControl: React.JSX.Element;
    extraPanel: { width: number; height: number };
    title: string;
    name: string;
  }) => {
    if (!item) return;
    if (item.onPress) {
      item.onPress();
      return;
    }
  };

  const AcceptButton = () => (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "blue",
        borderRadius: 14,
      }}
      onPress={hideMenu}
    >
      <MaterialIcons name={'check'} size={24} color="blue" />
    </TouchableOpacity>
  )

  return (
    <View style={{ backgroundColor: '#000000', paddingLeft: paddingLeft, paddingRight: paddingRight}}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={ICON_SIZE}
        snapToAlignment="start"
        data={buttons}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{marginHorizontal: 10}}
        renderItem={({ item }) => (
          item.extraControl ?
            <ContextMenu
              anchor={
                <View
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    marginHorizontal: 10,
                    marginVertical: 7,
                  }}
                >
                  <MaterialIcons name={item.icon} size={ICON_SIZE} color="white" />
                </View>
              }
              width={item.extraPanel?.width || 150}
              height={item.extraPanel?.height || 200}
              closeMenuAt={closeMenuAt}>
              <>
                <AcceptButton />
                {item.extraControl}
              </>
            </ContextMenu>
            : <TouchableOpacity
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                marginHorizontal: 10,
                marginVertical: 7,
              }}
              onPress={() => onButtonPress(item)}
            >
              {item.icon ? (
                <MaterialIcons name={item.icon} size={ICON_SIZE} color="white" />
              ) : (
                <Text style={{color: '#FFFFFF'}}>{item.name || "Icon"}</Text>
              )}
            </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ControlPanel;
