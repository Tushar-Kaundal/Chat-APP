import { ref, child, set } from 'firebase/database';
import React from 'react';
import { Button, Divider, Drawer, Message, toaster } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import { db } from '../../misc/firebase';
import EditableInput from './EditableInput';
import ProviderBlock from './ProviderBlock';

const DashBoard = ({ onSignOut }) => {
  const { profile } = useProfile();
  const onSave = async newData => {
    const userNicknameRef = child(
      ref(db, `/profiles/${profile.uid}`),
      `username`
    );
    try {
      await set(userNicknameRef, newData);
      toaster.push(
        <Message showIcon type="success" duration={2000}>
          Nickname has been updated
        </Message>
      );
    } catch (err) {
      toaster.push(
        <Message showIcon type="error" duration={2000}>
          {err.message}
        </Message>
      );
    }
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
        <ProviderBlock />
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
