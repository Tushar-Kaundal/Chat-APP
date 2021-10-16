import React from 'react';
import { Button, Drawer } from 'rsuite';
import { useProfile } from '../../context/profile.context';

const DashBoard = ({ onSignOut }) => {
  const { profile } = useProfile();
  return (
    <>
      <Drawer.Header>
        <Drawer.Title>Dashboard</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <h3>Hey,{profile.username}</h3>
      </Drawer.Body>
      <Drawer.Actions>
        <Button block color="red" appearance="primary" onClick={onSignOut}>
          Sign out
        </Button>
      </Drawer.Actions>
    </>
  );
};

export default DashBoard;
