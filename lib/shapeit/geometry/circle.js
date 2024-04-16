import * as _ from 'lodash';
import * as utils from '../utils';

// Import Vector from './vector';
import Vertex from './vertex.js';

class Circle {
	// X - The x value of the circle's center
	// y - The y value of the circle's center
	// r - The radius of the center
	// rad1 - The first radian of the circle, not necessarily its beginning
	// rad2 - The second radian of the circle, not necessarily its beginning
	constructor({x, y}, r, rad1 = 0, rad2 = 2 * Math.PI) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.rad1 = rad1;
		this.rad2 = rad2;
	}

	// Gets center as a vertex object
	getCenter() {
		return new Vertex(this.x, this.y);
	}

	// Gets the matching x value for the given radian
	getX(rad) {
		if (!this.hasRad(rad)) {
			return Number.NaN;
		}

		return this.r * Math.cos(rad) + this.x;
	}

	// Gets the matching y value for the given radian
	getY(rad) {
		if (!this.hasRad(rad)) {
			return Number.NaN;
		}

		return this.r * Math.sin(rad) + this.y;
	}

	// Gets the matching vertex for the given radian
	getVertex(rad) {
		if (!this.hasRad(rad)) {
			return Vertex.NaN;
		}

		return new Vertex({
			x: this.r * Math.cos(rad) + this.x,
			y: this.r * Math.sin(rad) + this.y,
		});
	}

	// Returns whether the circle contains the rad or not
	hasRad(rad) {
		// If calculated radian is in circle's radian range, return it
		if (rad != null && utils.isBetween(rad, this.rad1, this.rad2)) {
			return true;
		}

		let greatestRad;

		// The calculated radian can still be in the circle's radian range in case one
		// of the radians is greater than 2 PIEs
		greatestRad = Math.abs(this.rad1) > Math.abs(this.rad2) ? this.rad1 : this.rad2;

		// Check if the absolute radian is in the circle's radian range
		if (utils.isBetween(rad + (2 * Math.PI * Math.floor(greatestRad / (2 * Math.PI))),
			this.rad1, this.rad2)
        || utils.isBetween(rad + (2 * Math.PI * Math.ceil(greatestRad / (2 * Math.PI))),
        	this.rad1, this.rad2)) {
			return true;
		}

		return false;
	}

	// Gets the matching radian for the given vertex
	getRad(x, y) {
		const rad = Math.atan2(y - this.y, x - this.x);

		return this.hasRad(rad) ? rad : Number.NaN;
	}

	// Returns if circle has given vertices
	hasVertex(x, y) {
		return !Number.isNaN(this.getRad(x, y));
	}

	/*  GetIntersection(shape) {
    if (shape instanceof Circle)
      return this.getCircleIntersection(shape);
    if (shape instanceof Vector)
      return this.getVectorIntersection(shape);
  } */

	// circle - circle intersection method
	getCircleIntersection(circle) {
		const dx = circle.x - this.x;
		const dy = circle.y - this.y;
		const d = Math.hypot(dx, dy);

		if (d > this.r + circle.r
       || d < Math.abs(this.r - circle.r)) {
			return [];
		}

		const a = ((this.r ** 2 - circle.r ** 2) + d ** 2) / (2 * d);
		const x = this.x + ((dx * a) / d);
		const y = this.y + ((dy * a) / d);
		const h = Math.sqrt(this.r ** 2 - a ** 2);
		const rx = (-dy * h) / d;
		const ry = (dx * h) / d;

		let interVertices = [
			{
				x: x + rx,
				y: y + ry,
			},
			{
				x: x - rx,
				y: y - ry,
			},
		];

		interVertices = _.uniq(interVertices, ({x, y}) => `(${x}, ${y})`);

		[this, circle].forEach(circle => {
			interVertices = interVertices.filter(({x, y}) => circle.hasVertex(x, y));
		});

		Vertex.map(interVertices);
	}

	// Circle - vector intersection method
	getVectorIntersection(vector) {
		const x1 = vector.x1 - this.x;
		const x2 = vector.x2 - this.x;
		const y1 = vector.y1 - this.y;
		const y2 = vector.y2 - this.y;
		const dx = x2 - x1;
		const dy = y2 - y1;
		const d = Math.hypot(dx, dy);
		const h = (x1 * y2) - (x2 * y1);
		const delta = (this.r ** 2 * d ** 2) - h ** 2;

		if (delta < 0) {
			return Vertex.NaN;
		}

		let interVertices = [
			{
				x: (((h * dy) + (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta)))
            / d ** 2) + this.x,
				y: (((-h * dx) + (Math.abs(dy) * Math.sqrt(delta))) / d ** 2)
            + this.y,
			},
			{
				x: (((h * dy) - (((dy / Math.abs(dy)) || 1) * dx * Math.sqrt(delta)))
            / d ** 2) + this.x,
				y: (((-h * dx) - (Math.abs(dy) * Math.sqrt(delta))) / d ** 2)
            + this.y,
			},
		]
			.filter(({x, y}) => this.hasVertex(x, y) && vector.boundsHaveVertex(x, y));

		interVertices = _.uniq(interVertices, ({x, y}) => `(${x}, ${y})`);

		Vertex.map(interVertices);
	}

	// Moves entire circle to specified pivot
	moveTo(pivot) {
		return new Circle(pivot, this.r, this.rad1, this.rad2);
	}
}

export default Circle;
