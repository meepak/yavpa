import { useContext, useState } from "react";
import * as AvailableBrushes from "@u/brushes";
import MyRadioButtons from '@c/my-radio-buttons';
import { BrushType } from "@u/types";
import { Brushes } from "@u/brushes";
import Svg, { Line, Defs } from "react-native-svg";
import { SvgDataContext } from "@x/svg-data";

const SelectBrush = ({ value, onValueChanged }) => {
    const [brushValue, setBrushValue] = useState(value)
    const { svgData, setSvgData } = useContext(SvgDataContext);

    const handleBrushSelection = (guid: string) => {
        setBrushValue(guid);
        onValueChanged(guid);
    };

    // lets create brushes & if it's selected save it to the svgData.metadata
    const brushPreview = (brush: BrushType) => 
    <Svg height="50" width="200">
        <Defs>
            {AvailableBrushes.getBrush(brush)}
        </Defs>
        <Line
            x1="5"
            y1="27"
            x2="200"
            y2="27"
            stroke={"url(#" + brush.params.guid + ")"}
            strokeWidth={25}
        />
    </Svg>;

    const guids = Brushes.map((brush, index) => brush.params.guid);
    const brushes = Brushes.map((brush, index) => brushPreview(brush));

    return (
        <MyRadioButtons
            labels={brushes}
            values={guids}
            initialValue={brushValue}
            onChange={handleBrushSelection}
            numOfColumns={1}
            textStyle={{ marginLeft: 5, marginBottom: 5 }}
            iconStyle={{ size: 20, color: '#000000' }}
        />
    )
}

export default SelectBrush