import React, {useEffect, useState} from 'react';
import {type DimensionValue, View, type ViewStyle} from 'react-native';
import MyPreview from '@c/my-preview';
import {parseMyPathData} from '@u/helper';
import logoData from './my-path.json';

type MyPathLogoProperties = {
	width: DimensionValue;
	height: DimensionValue;
	animate: boolean;
	style?: ViewStyle;
	isLoaded?: (value: boolean) => void;
};

const MyPathLogo = ({width, height, animate, style = {}, isLoaded = (value: boolean) => {}}: MyPathLogoProperties) => {
	const lg = parseMyPathData(logoData);
	const [logo, setLogo] = useState(lg);
	if (!logo) {
		return null;
	}

	// Const onInit = () => { //if i do this all hell go loose, react goes mad and starts warning
	//     setTimeout(() => isLoaded && isLoaded(true), 200);
	// }
	useEffect(() => {
		isLoaded && isLoaded(true);
	}, []);

	return (
		<View style={[{width, height}, style]}>
			<MyPreview
				animate={animate}
				viewBox={logoData.metaData.viewBox}
				data={logo}
			/>
		</View>
	);
};

export default MyPathLogo;
