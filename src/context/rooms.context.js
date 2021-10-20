import { ref, off, onValue } from 'firebase/database';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../misc/firebase';
import { tramsformToArrWidthId } from '../misc/helper';

const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState(null);
  useEffect(() => {
    const roomListRef = ref(db, 'rooms');
    onValue(roomListRef, snap => {
      const data = tramsformToArrWidthId(snap.val());
      setRooms(data);
    });

    return () => {
      off(roomListRef);
    };
  }, []);
  return (
    <RoomsContext.Provider value={rooms}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);
