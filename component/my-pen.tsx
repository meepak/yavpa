import { createPathdata, getPathFromPoints } from "@u/helper";
import { MY_BLACK, PointType } from "@u/types";
import MyPath from "./my-path";

const MyPen = ({tip}:{tip: PointType}) => {
    // return bunch of MyPaths to represent pen at tip
    const penPoints: PointType[] = [];
    penPoints.push({ x: tip.x + 5, y: tip.y + 10 });
    penPoints.push({ x: tip.x, y: tip.y });
    penPoints.push({ x: tip.x + 10, y: tip.y + 5 });

    const pathData = createPathdata(MY_BLACK, 2, 1);
    pathData.path = getPathFromPoints(penPoints);
    return <MyPath
        key={'pen'}
        keyProp={'pen'}
        prop={pathData}
    />
}

export default MyPen;