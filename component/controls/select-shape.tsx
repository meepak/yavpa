import { AvailableShapes } from "@u/types";
import MyRadioButtons from '@c/my-radio-buttons';

const SelectShape = ({ color = 'black', value, onValueChanged }) => {

    const handleShapeSelection = (shape: string) => {
        onValueChanged(shape);
    };

    return (
        <MyRadioButtons
            labels={AvailableShapes}
            initialValue={value}
            onChange={handleShapeSelection}
            numOfColumns={2}
            textStyle={{ marginLeft: 10, marginBottom: 15 }}
            iconStyle={{ size: 20, marginBottom: 15, color: '#000000' }}
        />
    )
}

export default SelectShape