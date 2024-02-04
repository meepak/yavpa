import { useState } from 'react';
import { Slot } from 'expo-router';
import { SvgDataContext } from '@/svg/context';
import { createSvgData } from '@u/helper';


export const SvgDataProvider = ({ children }) => {
  const [svgData, setSvgData] = useState(createSvgData(0, 0)); // Initialize with default values

  return (
    <SvgDataContext.Provider value={{ svgData, setSvgData }}>
      {children}
    </SvgDataContext.Provider>
  );
};


export default function SvgLayout() {
  return (
    <SvgDataProvider>
      <Slot /> 
    </SvgDataProvider>
  );
}
