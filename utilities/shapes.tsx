import * as d3 from "d3-shape";
import { getPathFromPoints, precise } from "./helper";
import { PointType } from "./types";

export const AvailableShapes = [
    'freehand',
    '— line',
    '◯ circle',
    '□ square',
    '▭ rectangle',
    '☆ star',
    '♡ heart',
    '⬠ pentagon',
    '⬡ hexagon',
    'octagon'
]

// everything other than freehand is a shape
export const isValidShape = (name: string) => {
    return AvailableShapes.includes(name) && name !== AvailableShapes[0];
}

export const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // console.log("distance", distance, point1, point2);
    return distance;
};

export const shapeData = ({ name = "", start = { x: 0, y: 0 }, end = { x: 0, y: 0 } }) => {
    const shapeName = name.split(" ").pop()!.toLowerCase() || name;
    switch (shapeName) {
        case 'line':
            return LinePoints({ start, end });
        case 'circle':
            return CirclePoints({ start, end });
        case 'rectangle':
            return RectanglePoints({ start, end });
        case 'square':
            return PolygonPoints({ start, end, sides: 4 });
        case 'star':
            return StarPoints({ start, end });
        case 'heart':
            return HeartPoints({ start, end });
        case 'pentagon':
            return PolygonPoints({ start, end, sides: 5 });
        case 'hexagon':
            return PolygonPoints({ start, end, sides: 6 });
        case 'octagon':
            return PolygonPoints({ start, end, sides: 8 });
        default:
            return { path: "", length: 0 }
    }
}

const LinePoints = ({ start, end }) => {
        const x1 = precise(start.x);
        const y1 = precise(start.y);
        const x2 = precise(end.x);
        const y2 = precise(end.y);
        // const len = calculateDistance(start, end);
    return {
        path: `M${x1},${y1}L${x2},${y2}`,
        length: 0 //len.toFixed(precision) // this could be more efficient than polygonLength
    };
}

const RectanglePoints = ({ start, end, precision = 3 }) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(start.x - end.x);
    const height = Math.abs(start.y - end.y);
    return {
        path: `M${x},${y}L${x + width},${y}L${x + width},${y + height}L${x},${y + height}Z`,
        length: 0 //2 * (width + height) // this could be more efficient than polygonLength
    };
}

const CirclePoints =  ({ start, end }) => {
    // calculate the path of the circle between start and end point
    const radius = calculateDistance(start, end);
    // calculate points of the circle where center is start and radius is radius
    const points = 1000; // lets do this in proportion of radius
    const circlePoints:PointType[] = [];
    const step = 360 / points;
    for (let angle = 0; angle <= 360; angle += step) {
        const radian = (angle * Math.PI) / 180; // Convert degrees to radians
        const x = start.x + radius * Math.cos(radian);
        const y = start.y + radius * Math.sin(radian);
        circlePoints.push({ x: precise(x), y: precise(y) });
    }
    // remove first point
    // circlePoints.shift();
    return {
        path: getPathFromPoints(circlePoints),
        length: 0 //2 * Math.PI * radius // this could be more efficient than polygonLength
    };
}

const StarPoints = ({ start, end, precision = 3 }) => {
    const outerRadius = calculateDistance(start, end);
    const innerRadius = outerRadius / 2.5; // Adjust as needed
    const points:PointType[] = [];
    const angleStep = Math.PI / 5; // Divide by the number of star points

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(end.y - start.y, end.x - start.x);

    for (let i = 0; i <= 10; i++) { // Change to <= 10 to include the last point
        // Alternate between outer and inner radius
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep + startAngle; // Add the start angle to each angle
        const x = start.x + radius * Math.cos(angle);
        const y = start.y + radius * Math.sin(angle);
        points.push({ x, y });
    }
    // Calculate the length of one side and multiply it by 10
    // const sideLength = calculateDistance(points[0], points[1]);
    // const length = sideLength * 10;

    return {
        path: getPathFromPoints(points),
        length: 0, //length.toFixed(precision),
    };
}


const HeartPoints = ({ start, end, precision = 3}) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points:PointType[] = [];
    const steps = 100; // Increase for a smoother heart

    // Calculate the angle between the start and end points
    const startAngle = Math.PI/2-Math.atan2(dy, dx);

    // let length = 0;
    // let lastPoint = null;

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI; // Parameter that goes from 0 to 2PI
        const x = 16 * Math.pow(Math.sin(t), 3); // x-coordinate of the heart
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); // y-coordinate of the heart
        // Rotate the points
        const rotatedX = x * Math.cos(startAngle) - y * Math.sin(startAngle);
        const rotatedY = x * Math.sin(startAngle) + y * Math.cos(startAngle);
        // Scale and translate the points
        const point = {
            x: start.x + rotatedX * distance / 35, // Scale the heart to the distance between the points
            y: start.y - rotatedY * distance / 35, // Subtract y to flip the heart
        };
        points.push(point);

        // Calculate the length
        // if (lastPoint) {
        //     length += calculateDistance(lastPoint, point);
        // }
        // lastPoint = point as any;
    }

    return {
        path: getPathFromPoints(points),
        length: 0, //0length.toFixed(precision),
    };
}

const PolygonPoints = ({ start, end, sides, precision = 3 }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points:PointType[] = [];

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(dy, dx);

    // let length = 0;
    // let lastPoint = null;

    for (let i = 0; i <= sides; i++) { // Loop until sides + 1 to include the last point
        const angle = (i / sides) * 2 * Math.PI + startAngle; // Calculate the angle, add the start angle to rotate the polygon
        const x = start.x + distance * Math.cos(angle);
        const y = start.y + distance * Math.sin(angle);
        const point = { x, y };
        points.push(point);

        // Calculate the length
        // if (lastPoint) {
        //     length += calculateDistance(lastPoint, point);
        // }
        // lastPoint = point as any;
    }

    return {
        path: getPathFromPoints(points),
        length: 0,//length.toFixed(precision),
    };
}

// used in simply-smooth control and uses by canvas to draw
export const getD3CurveBasis = (d3Value: string): d3.CurveFactory | d3.CurveFactoryLineOnly | undefined => {
    switch (d3Value) {
        case "auto":
            return d3.curveBasis;
        case "open":
            return d3.curveBasisOpen;
        case "closed":
            return d3.curveBasisClosed;
        case "linear":
            return d3.curveLinear;
        default:
            return undefined;
    }
}