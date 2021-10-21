import Dashboard from '@rsuite/icons/Dashboard';
import React, { useCallback } from 'react';
import { Button, Drawer, toaster, Message } from 'rsuite';
import { ref, set } from '@firebase/database';
import DashBoard from '.';
import { useMediaQuery, useModalState } from '../../misc/custom-hooks';
import { auth, db } from '../../misc/firebase';
import { isOfflineForDatabase } from '../../context/profile.context';

const DashBoardToggle = () => {
  const { isOpen, open, close } = useModalState();
  const isMobile = useMediaQuery('(max-width:992px)');
  const onSignOut = useCallback(() => {
    set(ref(db, `/status/${auth.currentUser.uid}`), isOfflineForDatabase)
      .then(() => {
        auth.signOut();
        toaster.push(
          <Message showIcon type="info" duration={2000}>
            Signed Out
          </Message>
        );
        close();
      })
      .catch(err => {
        toaster.push(
          <Message showIcon type="error" duration={2000}>
            {err.message}
          </Message>
        );
      });
  }, [close]);
  return (
    <>
      <Button appearance="primary" block color="blue" onClick={open}>
        <Dashboard style={{ marginTop: '-4px', fontWeight: 'bold' }} />{' '}
        DashBoard
      </Button>
      <Drawer full={isMobile} open={isOpen} onClose={close} placement="left">
        <DashBoard onSignOut={onSignOut} />
      </Drawer>
    </>
  );
};

export default DashBoardToggle;
