// MyCheckBox.tsx
import { TouchableOpacity, Text, View, TextStyle, StyleProp } from "react-native";
import MyIcon, { MyIconStyle } from "./my-icon";
import React from "react";

const UNCHECKED_ICON_NAME = "checkbox-empty";
const CHECKED_ICON_NAME = "checkbox-checked";
const getIconName = (checked: boolean) => (checked ? CHECKED_ICON_NAME : UNCHECKED_ICON_NAME);

interface MyCheckBoxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: MyIconStyle;
  checkBoxFirst?: boolean;
}

const MyCheckBox: React.FC<MyCheckBoxProps> = ({label, checked, onChange, textStyle, iconStyle, checkBoxFirst = false }) => {
  const handlePress = () => {
    onChange();
  };
  const elements = [
    <MyIcon key="icon" name={getIconName(checked)} style={iconStyle}/>,
    <Text key="label" style={textStyle}>{label}</Text>  
  ]
  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {checkBoxFirst ? elements : elements.reverse()}
      </View>
    </TouchableOpacity>
  );
};

export default MyCheckBox;