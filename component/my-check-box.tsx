import {
  TouchableOpacity,
  Text,
  View,
  TextStyle,
  StyleProp } from "react-native";
import MyIcon, { MyIconStyle } from "./my-icon";
import React from "react";

const UNCHECKED_ICON_NAME = "checkbox-empty";
const CHECKED_ICON_NAME = "checkbox-checked";
const getIconName = (checked: boolean) => (checked ? CHECKED_ICON_NAME : UNCHECKED_ICON_NAME);

interface MyCheckBoxProps {
  label: any;
  checked: boolean;
  onChange: (checked: boolean) => void;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: MyIconStyle;
  checkBoxFirst?: boolean;
}

const MyCheckBox: React.FC<MyCheckBoxProps> = ({label, checked, onChange, textStyle, iconStyle, checkBoxFirst = false }) => {
  const handlePress = () => {
    onChange(!checked);
  };
  const elements = [
    <MyIcon key="icon" name={getIconName(checked)} style={iconStyle}/>
  ]
  if(typeof label === "string") {
    elements.push(<Text key="label" style={textStyle}>{label}</Text>);
  } else {
    elements.push(<View key="label">{label}</View>);
  }
  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {checkBoxFirst ? elements : elements.reverse()}
      </View>
    </TouchableOpacity>
  );
};

export default MyCheckBox;