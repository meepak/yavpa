import React, { useEffect, useRef, useState } from 'react';
import { createSvgData, jsonDeepCompare } from '@u/helper';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SvgDataContextType, SvgDataType } from '@u/types';
import { saveSvgToFile } from '@u/storage';


export const SvgDataContext = React.createContext<SvgDataContextType>({
  svgData: createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT),
  setSvgData: (value: React.SetStateAction<SvgDataType>) => {},
});
  
interface SvgDataProviderProps {
  children: React.ReactNode;
}

export const SvgDataProvider: React.FC<SvgDataProviderProps> = ({ children }) => {
    const [svgData, setSvgData] = useState(createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT));
    const prevSvgDataRef = useRef<SvgDataType>(createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT));

    useEffect(() => {
      console.log('[SvgDataProvider] svgData changed, saveSvgToFile useEffect triggered')
      if (prevSvgDataRef.current && prevSvgDataRef.current.metaData.guid !== "") {
        // Compare current svgData to previous version
        const difference = jsonDeepCompare(svgData, prevSvgDataRef.current);
        if (difference) {
          console.log('[SvgDataProvider] saving...difference was --', difference);
          saveSvgToFile(svgData);
        } else {
          console.log('[SvgDataProvider] saving CANCELLED...no difference');
        }
      } else {
        console.log('[SvgDataProvider] saving CANCELLED...no previous data');
      }
  
      // Update prevSvgDataRef with the current svgData after the comparison
      prevSvgDataRef.current = svgData;
    }, [svgData]);
  

    return (
      <SvgDataContext.Provider value={{ svgData, setSvgData }}>
        {children}
      </SvgDataContext.Provider>
    );
  };
  
  