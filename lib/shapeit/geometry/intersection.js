// Intersection.js
import Vector from './vector.js';
import Circle from './circle.js';

export function getIntersection(shape1, shape2) {
	if (shape1 instanceof Vector && shape2 instanceof Vector) {
		return shape1.getVectorIntersection(shape2);
	}

	if (shape1 instanceof Vector && shape2 instanceof Circle) {
		return shape1.getCircleIntersection(shape2);
	}

	if (shape1 instanceof Circle && shape2 instanceof Vector) {
		return shape2.getCircleIntersection(shape1);
	}
	// Add more conditions if there are more shape types
}
