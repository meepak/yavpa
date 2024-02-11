import React, { useState } from 'react';
import { createSvgData, SvgDataContextType } from '@u/helper';


export const SvgDataContext = React.createContext<SvgDataContextType>({
    svgData: createSvgData(0, 0), // replace with your actual default values
    setSvgData: () => {}, // empty function as default
  });
  


export const SvgDataProvider = ({ children }) => {
    const [svgData, setSvgData] = useState(createSvgData(0, 0)); // Initialize with default values
  
    return (
      <SvgDataContext.Provider value={{ svgData, setSvgData }}>
        {children}
      </SvgDataContext.Provider>
    );
  };
  
  