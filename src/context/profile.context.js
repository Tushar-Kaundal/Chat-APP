/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  ref,
  onValue,
  off,
  serverTimestamp,
  onDisconnect,
  set,
} from 'firebase/database';
import { auth, db } from '../misc/firebase';

export const isOfflineForDatabase = {
  state: 'offline',
  last_changed: serverTimestamp(),
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: serverTimestamp(),
};

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let userRef;
    let userStatusRef;
    const authUnsub = onAuthStateChanged(auth, authObj => {
      if (authObj) {
        userStatusRef = ref(db, `/status/${authObj.uid}`);
        userRef = ref(db, `/profiles/${authObj.uid}`);
        onValue(userRef, snap => {
          const { username, createdAt, avatar } = snap.val();

          const data = {
            username,
            createdAt,
            avatar,
            uid: authObj.uid,
            email: authObj.email,
          };
          setProfile(data);
          setIsLoading(false);
        });

        onValue(ref(db, '.info/connected'), snapshot => {
          // If we're not currently connected, don't do anything.
          if (snapshot.val() === false) {
            return;
          }
          // creating presence in realtime database
          set(onDisconnect(userStatusRef), isOfflineForDatabase).then(() => {
            set(userStatusRef, isOnlineForDatabase);
          });
        });
      } else {
        if (userRef) {
          off(userRef);
        }
        off(ref(db, '.info/connected'));
        if (userStatusRef) {
          off(userStatusRef);
        }
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => {
      authUnsub();
      if (userRef) {
        off(userRef);
      }
      off(ref(db, '.info/connected'));

      if (userStatusRef) {
        off(userStatusRef);
      }
    };
  }, []);
  return (
    <ProfileContext.Provider value={{ isLoading, profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
