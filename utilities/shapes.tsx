import { getPathFromPoints } from "./helper";

export const AvailableShapes = [
    'freehand',
    'line',
    'circle',
    'square',
    'rectangle',
    'star',
    'heart',
    'pentagon',
    'hexagon',
    'octagon'
]

export const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // console.log("distance", distance, point1, point2);
    return distance;
};

export const shapeData = ({ name = "", start = { x: 0, y: 0 }, end = { x: 0, y: 0 } }) => {
    switch (name) {
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
    return {
        path: `M${start.x},${start.y}L${end.x},${end.y}`,
        length: calculateDistance(start, end)
    };
}

const CirclePoints = ({ start, end }) => {
    // calculate the path of the circle between start and end point
    const radius = calculateDistance(start, end);
    // calculate points of the circle where center is start and radius is radius
    const points = 1000;
    const circlePoints = [];
    const step = 360 / points;
    for (let angle = 0; angle <= 365; angle += step) {
        const radian = (angle * Math.PI) / 180; // Convert degrees to radians
        const x = start.x + radius * Math.cos(radian);
        const y = start.y + radius * Math.sin(radian);
        circlePoints.push({ x: x, y: y } as never);
    }
    // remove first point
    circlePoints.shift();

    return {
        path: getPathFromPoints(circlePoints),
        length: 2 * Math.PI * radius
    };
}

const RectanglePoints = ({ start, end }) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(start.x - end.x);
    const height = Math.abs(start.y - end.y);
    return {
        path: `M${x},${y}L${x + width},${y}L${x + width},${y + height}L${x},${y + height}L${x},${y}`,
        length: 2 * (width + height)
    };
}

const StarPoints = ({ start, end }) => {
    const outerRadius = calculateDistance(start, end);
    const innerRadius = outerRadius / 2.5; // Adjust as needed
    const points = [];
    const angleStep = Math.PI / 5; // Divide by the number of star points

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(end.y - start.y, end.x - start.x);

    for (let i = 0; i <= 10; i++) { // Change to <= 10 to include the last point
        // Alternate between outer and inner radius
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = i * angleStep + startAngle; // Add the start angle to each angle
        const x = start.x + radius * Math.cos(angle);
        const y = start.y + radius * Math.sin(angle);
        points.push({ x, y } as never);
    }
    // Calculate the length of one side and multiply it by 10
    const sideLength = calculateDistance(points[0], points[1]);
    const length = sideLength * 10;

    return {
        path: getPathFromPoints(points),
        length,
    };
}


const HeartPoints = ({ start, end }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points = [];
    const steps = 100; // Increase for a smoother heart

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(dy, dx);

    let length = 0;
    let lastPoint = null;

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
        points.push(point as never);

        // Calculate the length
        if (lastPoint) {
            length += calculateDistance(lastPoint, point);
        }
        lastPoint = point as any;
    }

    return {
        path: getPathFromPoints(points),
        length,
    };
}

const PolygonPoints = ({ start, end, sides }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const points = [];

    // Calculate the angle between the start and end points
    const startAngle = Math.atan2(dy, dx);

    let length = 0;
    let lastPoint = null;

    for (let i = 0; i <= sides; i++) { // Loop until sides + 1 to include the last point
        const angle = (i / sides) * 2 * Math.PI + startAngle; // Calculate the angle, add the start angle to rotate the polygon
        const x = start.x + distance * Math.cos(angle);
        const y = start.y + distance * Math.sin(angle);
        const point = { x, y };
        points.push(point as never);

        // Calculate the length
        if (lastPoint) {
            length += calculateDistance(lastPoint, point);
        }
        lastPoint = point as any;
    }

    return {
        path: getPathFromPoints(points),
        length,
    };
}