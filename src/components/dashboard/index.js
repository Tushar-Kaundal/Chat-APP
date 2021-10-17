import React from 'react';
import { Button, Divider, Drawer } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import EditableInput from './EditableInput';

const DashBoard = ({ onSignOut }) => {
  const { profile } = useProfile();
  const onSave = async newData => {
    console.log(newData);
  };
  return (
    <>
      <Drawer.Header>
        <Drawer.Title>Dashboard</Drawer.Title>
        <Drawer.Actions>
          <Button block color="red" appearance="primary" onClick={onSignOut}>
            Sign out
          </Button>
        </Drawer.Actions>
      </Drawer.Header>
      <Drawer.Body style={{ margin: '0px', padding: '10px 30px' }}>
        <h3>Hey,{profile.username}</h3>
        <Divider />
        <EditableInput
          name="nickname"
          initialValue={profile.username}
          onSave={onSave}
          label={<h6 className="mb-2">Nickname</h6>}
        />
      </Drawer.Body>
    </>
  );
};

export default DashBoard;
