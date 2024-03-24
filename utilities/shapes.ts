import * as d3 from "d3-shape";
import { getPathFromPoints, precise } from "./helper";
import { AvailableShapes, PointType, ShapeType } from "./types";


// default shape is not an actual valid shape, it should fail shape validation
export const defaultShape = { name: "freehand", start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

// everything other than freehand is a shape
export const isValidShape = (name: string) => {
    return AvailableShapes.includes(name) && name !== AvailableShapes[0];
}

export const calculateDistance = (point1: PointType, point2: PointType) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // myConsole.log("distance", distance, point1, point2);
    return distance;
};

export const shapeData = (shape: ShapeType): string => {
    const shapeName = shape.name.split(" ").pop()!.toLowerCase() || shape.name;
    if(shape.start === shape.end) return "";
    switch (shapeName) {
        case 'line':
            return LinePath(shape.start, shape.end);
        case 'circle':
            return CirclePath(shape.start, shape.end);
        case 'rectangle':
            return RectanglePath(shape.start, shape.end);
        case 'square':
            return PolygonPath(shape.start, shape.end, 4);
        case 'star':
            return StarPath(shape.start, shape.end, 5);
        case 'star-6':
            return StarPath(shape.start, shape.end, 6);
        case 'star-8':
            return StarPath(shape.start, shape.end, 8);
        case 'star-10':
            return StarPath(shape.start, shape.end, 10);
        case 'heart':
            return HeartPath(shape.start, shape.end);
        case 'pentagon':
            return PolygonPath(shape.start, shape.end, 5);
        case 'hexagon':
            return PolygonPath(shape.start, shape.end, 6);
        case 'octagon':
            return PolygonPath(shape.start, shape.end, 8);
        case 'triangle':
            return PolygonPath(shape.start, shape.end, 3);
        default:
            return "";
    }
}

const LinePath = (start: PointType, end: PointType):string => {
    const x1 = precise(start.x);
    const y1 = precise(start.y);
    const x2 = precise(end.x);
    const y2 = precise(end.y);
    return `M${x1},${y1}L${x2},${y2}`;
}

const RectanglePath = (start: PointType, end: PointType):string => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(start.x - end.x);
    const height = Math.abs(start.y - end.y);
    return `M${x},${y}L${x + width},${y}L${x + width},${y + height}L${x},${y + height}Z`;
}

const CirclePath = (start: PointType, end: PointType):string => {
    const radius = calculateDistance(start, end);
    const points = 360; // lets do this in proportion of radius
    const circlePoints: PointType[] = [];
    const step = 360 / points;
    for (let angle = 0; angle <= 360; angle += step) {
        const radian = (angle * Math.PI) / 180;
        const x = start.x + radius * Math.cos(radian);
        const y = start.y + radius * Math.sin(radian);
        circlePoints.push({ x, y });
    }
    return getPathFromPoints(circlePoints);
}

const StarPath = (start: PointType, end: PointType, N = 6):string => {
    const outerRadius = calculateDistance(start, end);
    const innerRadius = outerRadius / (N / 2);
    const points: PointType[] = [];
    const angleStep = Math.PI / N;
    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(end.y - start.y, end.x - start.x);

    for (let i = 0; i <= (N * 2); i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep + startAngle;
        const x = start.x + radius * Math.cos(angle);
        const y = start.y + radius * Math.sin(angle);
        points.push({ x, y });
    }
    return getPathFromPoints(points);
}


const HeartPath = (start: PointType, end: PointType):string => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points: PointType[] = [];
    const steps = 100; // Increase for a smoother heart

    // Calculate the angle between the start and end points
    const startAngle = Math.PI / 2 - Math.atan2(dy, dx);

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        // Rotate the points
        const rotatedX = x * Math.cos(startAngle) - y * Math.sin(startAngle);
        const rotatedY = x * Math.sin(startAngle) + y * Math.cos(startAngle);
        // Scale and translate the points
        const point = {
            x: start.x + rotatedX * distance / 35, // Scale the heart to the distance between the points
            y: start.y - rotatedY * distance / 35, // Subtract y to flip the heart
        };
        points.push(point);
    }

    return getPathFromPoints(points);
}

const PolygonPath = (start: PointType, end: PointType, sides: number) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points: PointType[] = [];

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(dy, dx);

    for (let i = 0; i <= sides; i++) { // Loop until sides + 1 to include the last point
        const angle = (i / sides) * 2 * Math.PI + startAngle; // Calculate the angle, add the start angle to rotate the polygon
        const x = start.x + distance * Math.cos(angle);
        const y = start.y + distance * Math.sin(angle);
        const point = { x, y };
        points.push(point);
    }

    return getPathFromPoints(points);
}

// used in simply-smooth control and uses by canvas to draw
export const getD3CurveBasis = (d3Value: string, validShape: boolean): d3.CurveFactory | d3.CurveFactoryLineOnly | undefined => {
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
            if (!validShape) {
                return d3.curveBasis;
            } else {
                return d3.curveLinear;
            }
    }
}