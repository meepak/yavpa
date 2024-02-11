// RadioButtons.tsx
import React, { useState } from "react";
import { StyleProp, TextStyle, FlatList, View } from "react-native";
import MyCheckBox from "./my-check-box";
import { MyIconStyle } from "./my-icon";

interface RadioButtonsProps {
  labels: string[];
  initialValue?: string;
  onChange: (newValue: string) => void;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: MyIconStyle;
  numOfColumns?: number;
}

const RadioButtons: React.FC<RadioButtonsProps> = ({ labels, initialValue, onChange, textStyle, iconStyle, numOfColumns = 1 }) => {
  if (new Set(labels).size !== labels.length) {
    throw new Error("Labels must be unique");
  }

  const [selected, setSelected] = useState(initialValue || labels[0]);

  const handlePress = (label: string) => {
    setSelected(label);
    onChange(label);
  };

  return (
    <FlatList
      data={labels}
      renderItem={({ item: label }) => (
        <View style={{ width: `${100 / numOfColumns}%` }}>
          <MyCheckBox
            key={label}
            label={label}
            checked={label === selected}
            onChange={() => handlePress(label)}
            textStyle={textStyle}
            iconStyle={iconStyle}
            checkBoxFirst={true}
          />
        </View>
      )}
      keyExtractor={(item) => item}
      numColumns={numOfColumns}
    />
  );
};

export default RadioButtons;