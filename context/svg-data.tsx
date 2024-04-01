import React, { useEffect, useRef, useState } from 'react';
import { createMyPathData } from '@u/helper';
import { MyPathDataContextType, MyPathDataType } from '@u/types';


export const MyPathDataContext = React.createContext<MyPathDataContextType>({
  loadNewFile: (newMyPathData: MyPathDataType) => { },
  myPathData: createMyPathData(),
  setMyPathData: (value: React.SetStateAction<MyPathDataType>) => { },
  undo: () => { },
  redo: () => { },

});

interface MyPathDataProviderProps {
  children: React.ReactNode;
}

export const MyPathDataProvider: React.FC<MyPathDataProviderProps> = ({ children }) => {
  const [myPathData, setMyPathData] = useState(createMyPathData());
  const history = useRef<MyPathDataType[]>([]);
  const current = useRef(0);
  const performingUndoRedo = useRef(false);
  const prevMyPathData = useRef(myPathData);
  const loadingNewFile = useRef(false);

  const undo = () => {
    if (current.current > 0) {
      performingUndoRedo.current = true;
      current.current = current.current - 1;
      setMyPathData(history.current[current.current]);
    }
  };

  const redo = () => {
    if (current.current < history.current.length - 1) {
      performingUndoRedo.current = true;
      current.current = current.current + 1;
      setMyPathData(history.current[current.current]);
    }
  };

  const loadNewFile = (newMyPathData: MyPathDataType) => {
    loadingNewFile.current = true;
    setMyPathData(newMyPathData);
  };

  useEffect(() => {
    if (performingUndoRedo.current) {
      performingUndoRedo.current = false;
    } else if (!loadingNewFile.current && (
      JSON.stringify(myPathData.pathData) !== JSON.stringify(prevMyPathData.current.pathData) ||
      JSON.stringify(myPathData.imageData) !== JSON.stringify(prevMyPathData.current.imageData)
    )) {
      history.current = [...history.current, myPathData];
      current.current = history.current.length - 1;
    } else if(loadingNewFile.current) {
      history.current = [];
      current.current = 0;
      loadingNewFile.current = false;
    } else {
      prevMyPathData.current = myPathData;
    }
  }, [myPathData]);

  return (
    <MyPathDataContext.Provider value={{ loadNewFile, myPathData, setMyPathData, undo, redo }}>
      {children}
    </MyPathDataContext.Provider>
  );
};