import { useEffect, useState } from "react"
import MyColorPicker from "./my-color-picker";
import SelectBrush from "./select-brush";
import { Button, View } from "react-native";

const SelectBrushColor = ({ value, onValueChanged }) => {
    const [currentValue, setCurrentValue] = useState(value);
    const [selectedTab, setSelectedTab] = useState(value.startsWith('url(#') ? 'brush' : 'color');

    useEffect(() => {
        onValueChanged(currentValue);
    }, [currentValue]);

    const buttonColor = (button) => selectedTab === button ? '#0000ff' : '#dcc4fc';

    return (
        <View style={{ width: 280, height: 300 }}>
            <View style={{ marginRight: -15, flexDirection: 'row', justifyContent: 'flex-end' }}> 
                <View style={{ marginRight: 5 }}>
                    <Button title="Color" color={buttonColor('color')} onPress={() => setSelectedTab('color')} />
                </View>
                <Button title="Brush" color={buttonColor('brush')} onPress={() => setSelectedTab('brush')} />
            </View>
            <View style={{ marginTop: 5 }}>
                {selectedTab === 'color' && (
                    <View style={{ width: 320, height: 270 }}>
                        <MyColorPicker initialColor={currentValue} onColorSelected={(color: any) => setCurrentValue(color)} />
                    </View>
                )}

                {selectedTab === 'brush' && (
                    <View style={{ width: 320, height: 270 }}>
                        <SelectBrush value={currentValue} onValueChanged={(guid) => setCurrentValue("url(#" + guid + ")")} />
                    </View>
                )}
            </View>
        </View>
    )
}

export default SelectBrushColor;