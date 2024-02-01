import React, { useState } from "react";
import { TextInput, TouchableOpacity, View, Modal, Button, TouchableWithoutFeedback, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { useNavigation } from '@react-navigation/native';
import ControlPanel from "@/components/control-panel";
import Divider from "@/components/divider";
import ContextMenu from "@/components/context-menu";

const EDIT_ICON_TOGGLE_SET = ["draw", "lock-outline"];

const Header = ({ controlPanelButtons, onNameChange, isEditMode, setEditMode }) => {
    const [closeMenuAt, setCloseMenuAt] = useState(Date.now());
    const [name, setName] = useState('');
    const [editIcon, setEditIcon] = useState(EDIT_ICON_TOGGLE_SET[0]);
    // const navigation = useNavigation();  

    const toggleEditMode = () => {
        const newEditMode = !isEditMode
        setEditMode(newEditMode);
        return newEditMode;
    };

    const hideMenu = () => {
        setCloseMenuAt(() => Date.now());
    };

    const onChangeText = (text) => {
        setName(text);
        if (onNameChange) {
            onNameChange(text);
        }
    }

    const MenuItemTest = () => (
        <>
            <Text onPress={() => {
                console.log("menu option clicked");
                hideMenu();
            }}>Menu Option</Text>
            <Divider width={100} color={"black"} />
        </>
    )


    return (
        <View>
            <View
                style={{
                    margin: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <TouchableOpacity onPress={() => ({/*navigation.goBack()*/ })}>
                    <MaterialIcons name="arrow-back-ios" size={26} color="black" />
                </TouchableOpacity>
                <TextInput
                    style={{
                        flex: 1,
                        height: 40,
                        color: "black",
                        fontSize: 30,
                        fontWeight: "bold",
                        textAlign: "left",
                        borderWidth: 0,
                    }}
                    onChangeText={onChangeText}
                    value={name}
                    placeholder="Title"
                />
                <ContextMenu
                    anchor={
                        <MaterialIcons name="more-vert" size={32} color="black" />
                    }
                    width={150}
                    height={200}
                    closeMenuAt={closeMenuAt}>
                    <MenuItemTest />
                </ContextMenu>
            </View>
            <View pointerEvents="auto">
                <ControlPanel
                    buttons={controlPanelButtons}
                    paddingLeft={50}
                    paddingRight={10} />
                <View style={{ position: 'absolute', left: 0, top: -7 }}>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: "#000000",
                            width: 55,
                            height: 55,
                            borderRadius: 30,
                        }} >
                        <MaterialIcons
                            name={editIcon as "draw"}
                            size={28}
                            color="#FFFFFF"
                            onPress={() => {
                                const newEditMode = toggleEditMode();
                                setEditIcon(EDIT_ICON_TOGGLE_SET[newEditMode ? 0 : 1])
                            }
                            }
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

export default Header;