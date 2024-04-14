import { useState } from "react";
import * as AvailableBrushes from "@c/my-brushes";
import MyRadioButtons from '@c/my-radio-buttons';
import { BrushType, MY_BLACK } from "@u/types";
import { Brushes } from "@c/my-brushes";
import Svg, { Line, Defs } from "react-native-svg";
import { View } from "react-native";

const SelectBrush = ({ value, onValueChanged }) => {
    const [brushValue, setBrushValue] = useState(value.slice(5, -1))

    const handleBrushSelection = (guid: string) => {
        setBrushValue(guid);
        onValueChanged(guid);
    };

    // lets create brushes & if it's selected save it to the myPathData.metadata
    const brushPreview = (brush: BrushType) =>
    <Svg height="50" width="80">
        <Defs>
            {AvailableBrushes.getBrush(brush)}
        </Defs>
        <Line
            x1="5"
            y1="27"
            x2="85"
            y2="27"
            stroke={"url(#" + brush.params.guid + ")"}
            strokeWidth={25}
        />
    </Svg>;

    const guids = Brushes.map((brush, index) => brush.params.guid);
    const brushes = Brushes.map((brush, index) => brushPreview(brush));

    return (
        <View style ={{width: 110}}>
        <MyRadioButtons
            labels={brushes}
            values={guids}
            initialValue={brushValue}
            onChange={handleBrushSelection}
            numOfColumns={1}
            textStyle={{ marginLeft: 5, marginBottom: 5 }}
            iconStyle={{ size: 20, color: MY_BLACK }}
        />
        </View>
    )
}

export default SelectBrush