import {createPathdata, getPathFromPoints} from '@u/helper';
import {MY_BLACK, type PointType} from '@u/types';
import MyPath from './my-path';

const MyPen = ({tip}: {tip: PointType}) => {
	// Return bunch of MyPaths to represent pen at tip
	const penPoints: PointType[] = [];
	penPoints.push({x: tip.x + 6, y: tip.y + 13}, {x: tip.x, y: tip.y});
	penPoints.push({ x: tip.x + 13, y: tip.y + 6 });

	const pathData = createPathdata(MY_BLACK, 2, 1);
	pathData.path = getPathFromPoints(penPoints) + 'z';
	pathData.fill = MY_BLACK;

	const line1 = createPathdata(MY_BLACK, 2, 1);
	line1.path = getPathFromPoints([penPoints[0], {x: penPoints[0].x + 30, y: penPoints[0].y + 30}]);
	line1.path = getPathFromPoints([penPoints[1], { x: penPoints[1].x + 30, y: penPoints[1].y + 30 }]);
	return <MyPath
		key={'pen'}
		keyProp={'pen'}
		prop={pathData}
	/>;
};

export default MyPen;


/*
const pathData = createPathdata(MY_BLACK, 2, 1);
	pathData.path = `m1.944 2.11.034-.024zM.098.056C.078.043.045.005.025.022.005.038.034.076.04.096L.098.055zM.481.95c.464.248.513.044.414-.302.121.526-.14.409-.414.302Zm1.226 1.334-.034.024zM.369.852.325.864zm.038.046L.382.932zM.858.57.817.583zM.818.525.798.56zM.414.54c.025.03.06.043.08.03C.51.556.505.52.48.49zM.52.625A.054.054 0 0 1 .487.587L.375.545a.271.271 0 0 0 .162.19zM.487.587C.485.57.496.564.511.569L.494.46C.416.43.363.469.374.545zM.511.569c.016.006.03.023.032.038l.113.041a.271.271 0 0 0-.162-.19Zm.032.038C.546.622.535.63.52.625l.017.11c.078.028.13-.01.119-.087zm1.435 1.48C1.502 1.713.879.978.895.647c.155.618 1.049 1.474 1.05 1.463ZM.895.647zM.748.427.098.055zM.04.097l.241.669zm1.632 2.211.034-.024C1.757 2.272.93 1.115.48.95c.632.366 1.158 1.22 1.192 1.358Zm0 0c.086.147.365-.152.034-.024ZM.283.766c.012.036.023.067.042.098L.412.84c-.004-.007.016.045 0 0C.368.788.325.785.282.766zM.48.95C.44.924.438.87.431.864L.382.932C.41.958.447.928.482.95zM.325.864a.356.356 0 0 0 .057.068l.05-.068C.406.898.373.861.368.852zm.57-.216C.897.634.925.591.9.555L.817.583c.004.008.06.021.078.065zM.797.561.84.488C.813.464.783.447.748.427c0 0 .016.096.049.134zM.9.555A.359.359 0 0 0 .84.488L.798.561c.007.007.056 0 .061.008zm1.044 1.556c-.268.312.142.104.034-.025-.01-.012-.034.025 0 0zM.48.49C.393.384.297.209.098.056L.041.096c.08.145.233.294.372.445z`;
	pathData.stroke = MY_BLACK;
	pathData.strokeWidth = 2;
	const points = (getPointsFromPath(pathData.path));
	const sp = scalePoints(points, 10, 10, {x:1, y: 1});
	console.log(points);
	pathData.path = getPathFromPoints(sp);
*/