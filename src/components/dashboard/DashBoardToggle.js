import Dashboard from '@rsuite/icons/Dashboard';
import React, { useCallback } from 'react';
import { Button, Drawer, toaster, Message } from 'rsuite';
import DashBoard from '.';
import { useMediaQuery, useModalState } from '../../misc/custom-hooks';
import { auth } from '../../misc/firebase';

const DashBoardToggle = () => {
  const { isOpen, open, close } = useModalState();
  const isMobile = useMediaQuery('(max-width:992px)');
  const onSignOut = useCallback(() => {
    auth.signOut();
    toaster.push(
      <Message type="info" duration={4000}>
        Signed Out
      </Message>
    );
    close();
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
