import React, { useState } from 'react';
import { createSvgData, SvgDataContextType } from '@u/helper';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@u/constants';


export const SvgDataContext = React.createContext<SvgDataContextType>({
    svgData: createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT),
    setSvgData: () => {},
  });
  


export const SvgDataProvider = ({ children }) => {
    const [svgData, setSvgData] = useState(createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT));
    return (
      <SvgDataContext.Provider value={{ svgData, setSvgData }}>
        {children}
      </SvgDataContext.Provider>
    );
  };
  
  