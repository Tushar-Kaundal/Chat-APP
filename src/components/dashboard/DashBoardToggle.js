import Dashboard from '@rsuite/icons/legacy/Dashboard';
import React from 'react';
import { Button, Drawer } from 'rsuite';
import DashBoard from '.';
import { useMediaQuery, useModalState } from '../../misc/custom-hooks';

const DashBoardToggle = () => {
  const { isOpen, open, close } = useModalState();
  const isMobile = useMediaQuery('(max-width:992px)');
  return (
    <>
      <Button appearance="primary" block color="blue" onClick={open}>
        <Dashboard style={{ marginTop: '-4px', fontWeight: 'bold' }} />{' '}
        DashBoard
      </Button>
      <Drawer full={isMobile} open={isOpen} onClose={close} placement="left">
        <DashBoard />
      </Drawer>
    </>
  );
};

export default DashBoardToggle;
