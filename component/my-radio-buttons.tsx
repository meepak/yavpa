// RadioButtons.tsx
import React, { useState } from "react";
import { StyleProp, TextStyle, FlatList, View } from "react-native";
import MyCheckBox from "./my-check-box";
import { MyIconStyle } from "./my-icon";

interface RadioButtonsProps {
  labels: any[];
  values?: string[];
  initialValue?: string;
  onChange: (newValue: string) => void;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: MyIconStyle;
  numOfColumns?: number;
}

const RadioButtons: React.FC<RadioButtonsProps> = ({ labels, values, initialValue, onChange, textStyle, iconStyle, numOfColumns = 1 }) => {
  if (new Set(labels).size !== labels.length) {
    throw new Error("Labels must be unique");
  }
  if(values && new Set(values).size !== values.length) {
    throw new Error("Values must be unique");
  }

  if(values && labels.length !== values.length) {
    throw new Error("Labels and values must have the same length");
  }

  if(!values || values === undefined || values.length === 0) {
    values = labels;
  }

  const [selected, setSelected] = useState(initialValue || labels[0]);

  const handlePress = (label: string) => {
    setSelected(label);
    onChange(label);
  };

  return (
    <FlatList
      data={labels}
      renderItem={({ item: label }) => {
        const value = (values && values[labels.indexOf(label)]) || label;
        return (
        <View style={{ width: `${100 / numOfColumns}%` }}>
          <MyCheckBox
            key={value}
            label={label}
            checked={value === selected}
            onChange={() => handlePress(value)}
            textStyle={textStyle}
            iconStyle={iconStyle}
            checkBoxFirst={true}
          />
        </View>
      )}}
      keyExtractor={(item) => values && values[labels.indexOf(item)] || labels.indexOf(item).toString()}
      numColumns={numOfColumns}
    />
  );
};

export default RadioButtons;