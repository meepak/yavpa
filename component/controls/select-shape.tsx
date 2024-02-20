import { useState } from "react";
import { AvailableShapes } from "@u/shapes";
import MyRadioButtons from '@c/my-radio-buttons';

const SelectShape = ({ color = 'black', value, onValueChanged }) => {
    const [currentValue, setCurrentValue] = useState(value)

    const handleShapeSelection = (shape: string) => {
        setCurrentValue(shape);
        onValueChanged(shape);
    };

    return (
        <MyRadioButtons
            labels={AvailableShapes}
            initialValue={currentValue}
            onChange={handleShapeSelection}
            numOfColumns={2}
            textStyle={{ marginLeft: 10, marginBottom: 15 }}
            iconStyle={{ size: 20, marginBottom: 15, color: '#000000' }}
        />
    )
}

export default SelectShape