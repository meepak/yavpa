import {createPathdata, getPathFromPoints} from '@u/helper';
import {MY_BLACK, PointType} from '@u/types';
import type * as D3Path from 'd3-path';
import MyPath from './my-path';

const MyPathEdit = ({path}: {path: typeof D3Path}) => {
	// What about markers?

	const pathData = createPathdata(MY_BLACK, 2, 1);
	pathData.path = path.toString();

	return <MyPath
		key={'path-edit'}
		keyProp={'path-edit'}
		prop={pathData}
	/>;
};

export default MyPathEdit;
