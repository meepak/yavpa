import {getBoundaryBox} from '@c/my-boundary-box-paths';
import {type PathDataType, type MyPathDataType} from '@u/types';
import {useEffect} from 'react';

export const useSelectEffect = ({
	myPathData,
	setMyPathData,
	setEditMode,
	setActiveBoundaryBoxPath,
	stroke,
	strokeWidth,
	strokeOpacity,
}) => {
	useEffect(() => {
		const selectedPaths = myPathData.pathData.filter((item: PathDataType) => item.selected);

		if (selectedPaths.length === 0) {
			setActiveBoundaryBoxPath(() => null);
			setEditMode(true);
			return;
		}

		setEditMode(false);

		// MyConsole.log("selectedPaths", selectedPaths.length);
		const rectPathData = getBoundaryBox(selectedPaths);
		setActiveBoundaryBoxPath(rectPathData);
	}, [myPathData]);

	const updateSelectedPath = (property: string, value: any) => {
		if (!value) {
			return;
		}

		setMyPathData((previous: MyPathDataType) => {
			const newPathData = previous.pathData.map((item: PathDataType) => {
				if (item.selected) {
					return {
						...item,
						[property]: value,
					};
				}

				return item;
			});
			return {
				...previous,
				pathData: newPathData,
				metaData: {
					...previous.metaData,
					updatedAt: '',
				},
			};
		});
	};

	useEffect(() => {
		updateSelectedPath('stroke', stroke);
	}, [stroke]);

	useEffect(() => {
		updateSelectedPath('strokeWidth', strokeWidth);
	}, [strokeWidth]);

	useEffect(() => {
		updateSelectedPath('strokeOpacity', strokeOpacity);
	}, [strokeOpacity]);
};
