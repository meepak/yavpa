import React, { useState } from 'react';
import { createMyPathData } from '@u/helper';
import { MyPathDataContextType, MyPathDataType } from '@u/types';


export const MyPathDataContext = React.createContext<MyPathDataContextType>({
  myPathData: createMyPathData(),
  setMyPathData: (value: React.SetStateAction<MyPathDataType>) => { },
});

interface MyPathDataProviderProps {
  children: React.ReactNode;
}

export const MyPathDataProvider: React.FC<MyPathDataProviderProps> = ({ children }) => {
  const [myPathData, setMyPathData] = useState(createMyPathData());

  return (
    <MyPathDataContext.Provider value={{ myPathData, setMyPathData }}>
      {children}
    </MyPathDataContext.Provider>
  );
};

