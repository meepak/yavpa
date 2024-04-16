import * as _ from 'lodash';
import {fixedMod} from '../utils';
import Circle from './circle.js';
import Polygon from './polygon.js';
import Vector from './vector.js';

class Rectangle extends Polygon {
	// Creates a new rectangle instance given position and dimensions
	static fromScalars(x, y, w, h) {
		return new Rectangle([
			{x, y},
			{x: x + w, y},
			{x: x + w, y: y + h},
			{x, y: y + h},
		]);
	}

	constructor(vertices, {rotationProduct} = {}) {
		super(vertices, {closed: true});

		if (vertices.length != 4) {
			throw new TypeError('A rectangle must have 4 corners');
		}

		this.rotationProduct = rotationProduct;

		const cosines = this.getCosines();

		for (const cosine of cosines) {
			if (cosine.toFixed(5) != (Math.PI / 2).toFixed(5)) {
				throw new TypeError('All angles must be 1/2 radians');
			}
		}
	}

	getWidth(vectors = this.getVectors()) {
		return _.minBy(vectors, vector => Math.abs(vector.getAngle())).getLength();
	}

	getHeight(vectors = this.getVectors()) {
		return _.maxBy(vectors, vector => Math.abs(vector.getAngle())).getLength();
	}

	getRotation() {
		return _.minBy(this.getAngles(), Math.abs);
	}

	getIndexCorner() {
		const center = this.getCenter();
		const rotation = this.getRotation();
		const realRect = this.rotate(-rotation);
		const r = new Vector(center, this.vertices[0]).getLength();
		const circle = new Circle(center, r);
		const x = realRect.getMinX();
		const y = realRect.getMinY();
		const rad = circle.getRad(x, y);

		return circle.getVertex(rad + rotation);
	}

	// Rectangles' angles should be rounded, since this is most likely what the user wants.
	// If rotation product is not defined, will return self
	fitWith(polygon, useMirroring) {
		let fitPolygon = super.fitWith(polygon, useMirroring);

		if (this.rotationProduct) {
			const rotation = fitPolygon.getRotation();
			const module_ = fixedMod(rotation, this.rotationProduct);
			const sign = (Math.abs(module_) / module_) || 1;

			fitPolygon = module_ > this.rotationProduct / 2 ? fitPolygon.rotate(-sign * (module_ - this.rotationProduct)) : fitPolygon.rotate(-sign * module_);
		}

		return fitPolygon;
	}

	// Alias boundsHaveVertex()
	containsVertex(vertex) {
		return this.boundsHaveVertex(vertex);
	}
}

export default Rectangle;
