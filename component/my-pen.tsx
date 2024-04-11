import { createPathdata, getPathFromPoints } from "@u/helper";
import { MY_BLACK, PointType } from "@u/types";
import MyPath from "./my-path";

const MyPen = ({tip}:{tip: PointType}) => {
    // return bunch of MyPaths to represent pen at tip
    const penPoints: PointType[] = [];
    penPoints.push({ x: tip.x + 6, y: tip.y + 13 });
    penPoints.push({ x: tip.x, y: tip.y });
    // penPoints.push({ x: tip.x + 13, y: tip.y + 6 });

    const pathData = createPathdata(MY_BLACK, 2, 1);
    pathData.path = getPathFromPoints(penPoints) + 'z';
    pathData.fill = MY_BLACK;

    const line1 = createPathdata(MY_BLACK, 2, 1);
    line1.path = getPathFromPoints([penPoints[0], { x: penPoints[0].x + 30, y: penPoints[0].y + 30 }]);
    // line1.path = getPathFromPoints([penPoints[1], { x: penPoints[1].x + 30, y: penPoints[1].y + 30 }]);
    return <MyPath
        key={'pen'}
        keyProp={'pen'}
        prop={pathData}
    />
}

export default MyPen;