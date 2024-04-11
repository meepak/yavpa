/*
[scale  0      offsetX][x_svg]
[0      scale  offsetY ] * [y_svg]
[0      0      1       ][1]
*/

// write a generic function to multiply two matrices
function multiplyMatrix(m1, m2) {
    let result = [];
    for (let i = 0; i < m1.length; i++) {
        result[i] = [];
        for (let j = 0; j < m2[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

// write a funciton to inverse a matrix
function inverseMatrix(matrix) {
    const a = matrix[0][0], b = matrix[0][1], c = matrix[0][2],
        d = matrix[1][0], e = matrix[1][1], f = matrix[1][2],
        g = matrix[2][0], h = matrix[2][1], i = matrix[2][2];

    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    if (det === 0) {
        console.error('Cannot invert matrix, determinant is 0');
        return matrix;
    }

    return [
        [(e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det],
        [(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
        [(d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det]
    ];
}


// get 3x3 matrix for given value of scale and offsetX & offsetY
function getTransformationMatrix(scale, offsetX, offsetY) {
    return [
        [scale, 0, offsetX],
        [0, scale, offsetY],
        [0, 0, 1]
    ];
}

// get 3x1 matrix for given x and y
// get 3x1 matrix for given x and y
function getSvgPointMatrix(x, y) {
    return [[x], [y], [1]]; // Adjusted to return a column matrix
}


// get svg point for given screen point
export function getSvgPoint(xScreen, yScreen, scale, offsetX, offsetY) {
    let transformationMatrix = getTransformationMatrix(scale, offsetX, offsetY);
    let inverseTransformationMatrix = inverseMatrix(transformationMatrix);
    let screenPointMatrix = getSvgPointMatrix(xScreen, yScreen);
    let svgPointMatrix = multiplyMatrix(inverseTransformationMatrix, screenPointMatrix);
    return { x: svgPointMatrix[0][0], y: svgPointMatrix[1][0] };
}


export function getScreenPoint(xSvg, ySvg, scale, offsetX, offsetY) {
    let transformationMatrix = getTransformationMatrix(scale, offsetX, offsetY);
    let svgPointMatrix = getSvgPointMatrix(xSvg, ySvg);
    let screenPointMatrix = multiplyMatrix(transformationMatrix, svgPointMatrix);
    return { x: screenPointMatrix[0][0], y: screenPointMatrix[1][0] };
}
