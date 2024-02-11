
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import simplify from 'simplify-js';
import MySlider from '@c/controls/my-slider';
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getPathFromPoints } from '@u/helper';
import MyRadioButtons from '@c/my-radio-buttons';
import { getD3CurveBasis } from '@u/shapes';

// Define a fixed set of points for the polyline
// Function to generate points that form a circle
const generateCirclePoints = (radius: number, numPoints: number) => {
    const points: { x: number, y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        points.push({
            x: radius * Math.cos(angle) + radius,
            y: radius * Math.sin(angle) + radius,
        });
    }
    return points;
};

const D3VALUES = [
    { key: "none", label: "No smoothing" },
    { key: "linear", label: "Discreet Lines" },
    { key: "auto", label: "Auto smoothing" },
    { key: "open", label: "Auto smoothing with end open" },
    { key: "closed", label: "Auto smoothing with end closed" },
]

// Generate points for a circle with a radius of 50 and 100 points
const circlePoints = generateCirclePoints(50, 10);

const SimplifySmooth = ({
    color = "black",
    simplifyValue,
    onSimplifyValueChanged,
    d3Value,
    onD3ValueChanged
}) => {
    const [currentSimplify, setCurrentSimplify] = useState(simplifyValue)
    const [currentD3, setCurrentD3Value] = useState(d3Value)
    const [smoothPoints, setSmoothPoints] = useState("")

    useEffect(() => {
        const simplifiedPoints = simplify(circlePoints, currentSimplify);

        if (onSimplifyValueChanged) {
            onSimplifyValueChanged(currentSimplify);
        }

        let curveBasis = getD3CurveBasis(currentD3);

        if (curveBasis) {
            const line = d3.line().curve(curveBasis);
            let spoints = line(simplifiedPoints.map(p => [p.x, p.y])) || "";

            setSmoothPoints(() => spoints);

            if (onD3ValueChanged) {
                onD3ValueChanged(currentD3);
            }
        } else {
            setSmoothPoints(getPathFromPoints(simplifiedPoints));

        }
    }, [currentSimplify, currentD3])
    return (
        <View style={{ flex: 1, position: 'absolute', top: 5, paddingHorizontal: 10 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Simplify & Smooth path</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, marginLeft: 50 }}>
                <View style={{ position: 'absolute' }}>
                    <Svg height="100" width="150">
                        <Path
                            d={smoothPoints}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                        />
                    </Svg>
                </View>
                <View style={{ position: 'absolute' }}>
                    <Svg height="100" width="150">
                        <Path
                            d={getPathFromPoints(circlePoints)}
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            opacity={0.25}
                        />
                    </Svg>
                </View>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 15, }}>
                <MySlider
                    style={{ width: 250, height: 40 }}
                    minimumValue={0}
                    maximumValue={30}
                    step={0.01}
                    value={simplifyValue}
                    onValueChange={(value) => {
                        setCurrentSimplify(value);
                        onSimplifyValueChanged(value);
                    }}
                />
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <MyRadioButtons
                    labels={D3VALUES.map(value => value.label)}
                    initialValue={D3VALUES.find(value => value.key === currentD3)?.label}
                    onChange={(label) => {
                        const value = D3VALUES.find(value => value.label === label)?.key;
                        setCurrentD3Value(value);
                        onD3ValueChanged(value);
                    }}
                    textStyle={{ marginLeft: 5, marginBottom: 5}}
                    iconStyle={{ size: 20, color: '#000000', strokeWidth: 2}}
                />
            </View>
        </View>
    )
}

export default SimplifySmooth;