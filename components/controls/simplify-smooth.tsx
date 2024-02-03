import { Switch, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import simplify from 'simplify-js';
import MySlider from '@c/controls/slider';
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getPathFromPoints } from '@u/helper';

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

        if (currentD3 !== null) {

            // Create a line generator
            let curveBasis = d3.curveBasis;
            if (currentD3 === "closed") {
                curveBasis = d3.curveBasisClosed;
            } else if (currentD3 === "open") {
                curveBasis = d3.curveBasisOpen;
            };
            const line = d3.line().curve(curveBasis);
            // Generate the path data
            let spoints = line(simplifiedPoints.map(p => [p.x, p.y])) || ""; // Assign an empty string if line(points) is null.

            setSmoothPoints(() => spoints);
        } else {
            setSmoothPoints(() => getPathFromPoints(simplifiedPoints));
        }

        if (onSimplifyValueChanged) {
            onSimplifyValueChanged(currentSimplify);
        }
        if (onD3ValueChanged) {
            onD3ValueChanged(currentD3);
        }
    }, [currentSimplify, currentD3])

    return (
        <>
        <View style={{ position: 'absolute', top: 0, zIndex: -2 }}>
            <Svg height="100" width="250">
                <Path
                    d={smoothPoints}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                />
            </Svg>
        </View>
            <View style={{ position: 'absolute', top: 0, zIndex: -5 }}>
                <Svg height="100" width="250">
                    <Path
                        d={getPathFromPoints(circlePoints)}
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        opacity={0.25}
                    />
                </Svg>
            </View>

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

            <View>
                <View style={{ flexDirection: "row" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Switch
                            value={currentD3 === null}
                            onValueChange={(value) => {
                                setCurrentD3Value(value ? null : "auto");
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
                            value={currentD3 === "auto"}
                            onValueChange={(value) => {
                                setCurrentD3Value(value ? "auto" : null);
                            }}
                        />
                        <Text>Auto</Text>
                    </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Switch
                            value={currentD3 === "open"}
                            onValueChange={(value) => {
                                setCurrentD3Value(value ? "open" : null);
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
                            value={currentD3 === "closed"}
                            onValueChange={(value) => {
                                setCurrentD3Value(value ? "closed" : null);
                            }}
                        />
                        <Text>Closed</Text>
                    </View>
                </View>
            </View>
        </>
    )
}

export default SimplifySmooth;