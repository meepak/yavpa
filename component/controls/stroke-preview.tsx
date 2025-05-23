
import * as AvailableBrushes from '@c/controls/my-brushes';
import {useEffect, useState} from 'react';
import Svg, {Defs, Path} from 'react-native-svg';

const StrokePreview = ({stroke, strokeWidth, strokeOpacity, width, height}) => {
	const [brush, setBrush] = useState<React.ReactNode | undefined>(null);

	useEffect(() => {
		if (stroke.startsWith('url')) {
			const brushGuid = stroke.slice(5, -1);
			const brushFound = AvailableBrushes.Brushes.find(b => b.params.guid === brushGuid);
			if (brushFound) {
				setBrush(AvailableBrushes.getBrush(brushFound));
			}
		} else {
			setBrush(null);
		}
	}, [stroke]);

	return (
		<Svg width={width} height={height}>
			{brush
                    && <Defs>
                    	{brush}
                    </Defs>}
			<Path
				d={`M0,${height / 2}L${width},${height / 2}`}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
			/>
		</Svg>

	);
};

export default StrokePreview;
