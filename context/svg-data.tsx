import React, { useState } from 'react';
import { createSvgData } from '@u/helper';
import { SvgDataContextType, SvgDataType } from '@u/types';


export const SvgDataContext = React.createContext<SvgDataContextType>({
  svgData: createSvgData(),
  setSvgData: (value: React.SetStateAction<SvgDataType>) => { },
});

interface SvgDataProviderProps {
  children: React.ReactNode;
}

export const SvgDataProvider: React.FC<SvgDataProviderProps> = ({ children }) => {
  const [svgData, setSvgData] = useState(createSvgData());

  return (
    <SvgDataContext.Provider value={{ svgData, setSvgData }}>
      {children}
    </SvgDataContext.Provider>
  );
};

