import * as _ from 'lodash';

export function fixedMod(a, b) {
	return ((a % b) + b) % b;
}

export function isBetween(value, limit1, limit2) {
	let min; let max;

	if (limit1 < limit2) {
		min = limit1;
		max = limit2;
	} else {
		min = limit2;
		max = limit1;
	}

	return value >= min && value <= max;
}

export function isBetweenThreshold(dst, source, threshold) {
	return isBetween(dst, source - threshold, source + threshold);
}

export function getStandardDeviation(values) {
	const mean = _.mean(values);

	const squareDiffs = values.map(value => {
		const diff = value - mean;
		const sqrDiff = diff ** 2;

		return sqrDiff;
	});

	const meanSquareDiff = _.mean(squareDiffs);
	const std = Math.sqrt(meanSquareDiff);

	return std;
}

// Gives a score between 0 (poor) and 1 (best) to determine how likely is it for the
// destination values to represent the same thing as source values
export function matchScore(dstValues, sourceValues, maxOffset = sourceValues.length, offset = 0) {
	if (offset == maxOffset) {
		return 0;
	}

	if (dstValues.length != sourceValues.length) {
		return 0;
	}

	// Switch variation based on offset
	dstValues = dstValues.slice();
	sourceValues = sourceValues.slice(offset).concat(sourceValues.slice(0, offset));

	// Get the best score for the current variation using a simple sum
	const linearScores = dstValues.map((dstValue, index) => {
		const sourceValue = sourceValues[index];
		const [part, whole] = [dstValue, sourceValue].sort();
		const ratio = part / whole;

		return ratio;
	});

	const linearScore = _.mean(linearScores);

	// Return the biggest variation score
	// Note that we use _.max and not Math.max since we a Number object should be returned
	// instead of a primitive value
	const alternativeScore = matchScore(arguments[0], arguments[1], maxOffset, offset + 1);
	let bestScore = _.max([linearScore, alternativeScore]);

	// Set meta data, if not already set
	if (!(bestScore instanceof Number)) {
		bestScore = new Number(bestScore);
		bestScore.offset = offset;
	}

	return bestScore;
}

export function isSimilar(a, b) {
	return a >= b - Number.EPSILON && a <= b + Number.EPSILON;
}
