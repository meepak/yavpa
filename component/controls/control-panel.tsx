import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import MyIcon from "@c/my-icon";
import ContextMenu from "component/controls/context-menu";
import { isAndroid, isIOS } from "@u/helper";

const BUTTON_HEIGHT = 42;
const ICON_SIZE = 28;

const ControlPanel = ({ buttons, paddingLeft=40, paddingRight=40 }) => {

  const [forceRerenderAt, setForceRerenderAt] = useState(Date.now());

  const hideMenu = () => setForceRerenderAt(Date.now());

  const onButtonPress = (item: {
    onPress: () => void;
    icon: string;
    extraControl: React.JSX.Element;
    extraPanel: { width: number; height: number };
    title: string;
    name: string;
    toggleIcons?: string[];
  }) => {
    if (!item) return;
    if (item.onPress) {
      item.onPress();
      if(item.toggleIcons && item.toggleIcons.length === 2 && item.toggleIcons.includes(item.icon)) {
        const iconIndex = item.toggleIcons.indexOf(item.icon) === 0 ? 1 : 0;
        item.icon = item.toggleIcons[iconIndex];
        setForceRerenderAt(Date.now()); // force rerender
      }
      return;
    }
  };

  const AcceptButton = () => (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 0,
        right: 10,
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#000000",
        borderRadius: 14,
      }}
      onPress={hideMenu}
    >
      <MyIcon color={'#111111'} name={'ok'} />
    </TouchableOpacity>
  )

  return (
    <View style={{ backgroundColor: 'transparent', paddingLeft: paddingLeft, paddingRight: paddingRight}}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={ICON_SIZE}
        snapToAlignment="start"
        data={buttons}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{marginLeft: 10, marginTop: isIOS ? 15 : 0}}
        renderItem={({ item }) => (
          item.extraControl ?
            <ContextMenu
              anchor={
                <View
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    marginHorizontal: 7,
                    marginVertical: 7,
                  }}
                >
                  <MyIcon name={item.icon} />
                </View>
              }
              width={item.extraPanel?.width || 150}
              height={item.extraPanel?.height || 200}
              closeMenuAt={forceRerenderAt}>
              <>
                <AcceptButton />
                {item.extraControl}
              </>
            </ContextMenu>
            : <TouchableOpacity
              style={{
                // width: ICON_SIZE,
                height: ICON_SIZE,
                marginHorizontal: 10,
                marginVertical: 7,
              }}
              onPress={() => onButtonPress(item)}
            >
              {item.icon ? (
                <MyIcon name={item.icon} />
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
