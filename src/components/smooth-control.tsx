import React, { useEffect, useState } from "react";
import { View, Text, Switch } from "react-native";

const SmoothControl = ({ value, onValueChanged }) => {
    const [d3CurveBasis, setD3CurveBasis] = useState(value);
    
    useEffect(() => {
        if (onValueChanged) {
            onValueChanged(d3CurveBasis);
        }
    }, [d3CurveBasis]);

    return (
        <View style={{ flexDirection: "row" }}>
        <View
            style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <Switch
            value={d3CurveBasis === null}
            onValueChange={(value) => {
                setD3CurveBasis(value ? null : "auto");
            }}
            />
            <Text>None</Text>
        </View>
        <View
            style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <Switch
            value={d3CurveBasis === "auto"}
            onValueChange={(value) => {
                setD3CurveBasis(value ? "auto" : null);
            }}
            />
            <Text>Auto</Text>
        </View>
        <View
            style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <Switch
            value={d3CurveBasis === "open"}
            onValueChange={(value) => {
                setD3CurveBasis(value ? "open" : null);
            }}
            />
            <Text>Open</Text>
        </View>
        <View
            style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            }}
        >
            <Switch
            value={d3CurveBasis === "closed"}
            onValueChange={(value) => {
                setD3CurveBasis(value ? "closed" : null);
            }}
            />
            <Text>Closed</Text>
        </View>
        </View>
    );
}

export default SmoothControl;
