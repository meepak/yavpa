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
            numOfColumns={3}
            textStyle={{ marginLeft: 5, marginBottom: 5 }}
            iconStyle={{ size: 20, color: '#000000' }}
        />
    )
}

export default SelectShape