import Svg from 'react-native-svg';
import React, {useEffect, useRef} from 'react';
import {CANVAS_VIEWBOX_DEFAULT, type PathDataType, type MyPathDataType, CANVAS_WIDTH, CANVAS_HEIGHT} from '@u/types';
import MyPath from './pure/my-path';
import SvgAnimate from '../screens/file/preview/animate';
import MyPathImage from './pure/my-path-image';
import { getViewBox } from '@u/helper';

const MyPreview
  = ({data, animate, onInit}:
  {
  	data: MyPathDataType;
  	animate: boolean | undefined;
  	// viewBox?: string;
  	onInit?: (playTime: number) => void;

  }) => {
  	const playTime = useRef<number>(0);

  	useEffect(() => {
  		if (onInit) {
  			playTime.current = data.pathData.reduce((accumulator, path) => accumulator + path.time, 0);
  			playTime.current += data.metaData.animation?.delay || 0;
  			playTime.current += data.metaData.animation?.transition || 0;
  			onInit(playTime.current);
  		}
  	}, []);

  	return animate ? (
      <SvgAnimate
        myPathData={data}
      />
    ) : (
      <Svg
        width="100%"
        height="100%"
        viewBox={getViewBox(data.metaData)}
      >
        {data.imageData?.map((item) =>
          item.visible ? (
            <MyPathImage
              prop={item}
              keyProp={"completed-" + item.guid}
              key={item.guid}
            />
          ) : null,
        )}

        {data.pathData.map((path: PathDataType, index: number) => {
          if (!path.visible) {
            return null;
          }

          return (
            <React.Fragment key={index}>
              <MyPath prop={path} keyProp={"preview"} />
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

export default MyPreview;
