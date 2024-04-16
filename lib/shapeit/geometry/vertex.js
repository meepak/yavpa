let NaNVertex;

class Vertex {
	static get NaN() {
		return NaNVertex;
	}

	// Ensures that plain objects are actually instances of the Vertex class
	static map(vertices) {
		return vertices.map(vertex => new Vertex(vertex));
	}

	constructor(x, y) {
		if (arguments.length == 1) {
			const coord = arguments[0];

			if (Array.isArray(coord)) {
				x = coord[0];
				y = coord[1];
			} else if (coord instanceof Object) {
				x = coord.x;
				y = coord.y;
			}
		}

		this.x = x;
		this.y = y;
	}
}

NaNVertex = new Vertex(Number.NaN, Number.NaN);

export default Vertex;
