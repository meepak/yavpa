import React from 'react';
import { createSvgData, SvgDataContextType } from '@u/helper';


export const SvgDataContext = React.createContext<SvgDataContextType>({
    svgData: createSvgData(0, 0), // replace with your actual default values
    setSvgData: () => {}, // empty function as default
  });
  