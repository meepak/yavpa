import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import MyIcon from "@c/my-icon";
import ContextMenu from "component/controls/context-menu";
import { I_AM_IOS, ModalAnimations } from "@u/types";

const ICON_SIZE = 28;

const ControlPanel = ({ buttons, paddingLeft = 40, paddingRight = 40 }) => {

  const [forceRerenderAt, setForceRerenderAt] = useState(Date.now());

  // const hideMenu = () => setForceRerenderAt(Date.now());

  const onToolsButtonPress = (item: {
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
      if (item.toggleIcons && item.toggleIcons.length === 2 && item.toggleIcons.includes(item.icon)) {
        const iconIndex = item.toggleIcons.indexOf(item.icon) === 0 ? 1 : 0;
        item.icon = item.toggleIcons[iconIndex];
        setForceRerenderAt(Date.now()); // force rerender
      }
      return;
    }
  };

  // const AcceptButton = () => (
  //   <TouchableOpacity
  //     style={{
  //       position: 'absolute',
  //       bottom: 0,
  //       right: 10,
  //       width: 28,
  //       height: 28,
  //       justifyContent: "center",
  //       alignItems: "center",
  //       borderWidth: 2,
  //       borderColor: "#120e31",
  //       borderRadius: 14,
  //     }}
  //     onPress={hideMenu}
  //   >
  //     <MyIcon color={'#111111'} name={'ok'} />
  //   </TouchableOpacity>
  // )

  return (
    <View style={{
      backgroundColor: 'transparent',
      paddingLeft: paddingLeft,
      paddingRight: paddingRight,
      height: 40,
    }}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="normal"
        snapToAlignment="end"
        data={buttons}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ marginLeft: 10, alignItems: 'baseline' }}
        fadingEdgeLength={20}
        renderItem={({ item }) => (
          item.extraControl ?
            <ContextMenu
              anchor={
                <View
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    marginHorizontal: 7,
                  }}
                >
                  <MyIcon name={item.icon} />
                </View>
              }
              width={item.extraPanel?.width || 150}
              height={item.extraPanel?.height || 200}
              closeMenuAt={forceRerenderAt}
              animationIn={item.key == 'layers' ? ModalAnimations.slideInRight : undefined}
              animationOut={item.key == 'layers' ? ModalAnimations.slideOutRight : undefined}
              >
              <>
                {/* <AcceptButton /> */}
                {item.extraControl}
              </>
            </ContextMenu>
            // tool bar icon button press
            : <TouchableOpacity
              style={{
                height: ICON_SIZE,
                marginHorizontal: 10,
              }}
              onPress={() => onToolsButtonPress(item)}
            >
              {item.icon ? (
                <MyIcon name={item.icon} />
              ) : (
                <Text style={{ color: '#FFFFFF' }}>{item.name || "Icon"}</Text>
              )}
            </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ControlPanel;
