import {precise} from '../utilities/helper';
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	type PathDataType,
	type MyPathDataType,
} from '../utilities/types';
import { FPS } from "./types";
import { createLayer, createComposition } from './utils';



function createLottie(myPathData: MyPathDataType) {
	// Extract width and height from viewBox
	// const viewBox = myPathData.metaData.viewBox.split(' ');
	// const width = Math.round(parseFloat(viewBox[2]));
	// const height = Math.round(parseFloat(viewBox[3]));
	const width = Number.parseInt(CANVAS_WIDTH.toFixed(0));
	const height = Number.parseInt(CANVAS_HEIGHT.toFixed(0));

	const layers: any[] = [];

	// Make deep copy of myPathData.pathData and reverse it
	const clonedPathData = JSON.parse(JSON.stringify(myPathData.pathData));

	const speed = myPathData.metaData.animation?.speed || 1;
	const totalTime = clonedPathData.reduce((accumulator: number, path: PathDataType) => accumulator + path.time, 0);
	const totalFrames = FPS * precise(totalTime / (1000 * speed), 0);

	let pathStartFrame = 0;
	let index = 0;
	clonedPathData.forEach((path: PathDataType) => {
		const pathTotalFrames = FPS * precise(path.time / (1000 * speed), 0);
		const layer = createLayer(path, pathStartFrame, pathTotalFrames + pathStartFrame, totalFrames);
		layers.push(layer);
		pathStartFrame += pathTotalFrames;
		index++;
	});

	// Const totalFrames = pathStartFrame;
	const lottie = createComposition({width, height, totalFrames});
	lottie.layers = layers.reverse() as any; // Reverse so the stacking layer matches of svg

	const lottieJson = JSON.stringify(lottie);
	// MyConsole.log(lottieJson);
	return lottieJson;
}

export default createLottie;
