import React from 'react';
import { Button, Modal } from 'rsuite';
import { useModalState } from '../../../misc/custom-hooks';
import ProfileAvatar from '../../dashboard/ProfileAvatar';

const ProfileInfoBtnModal = ({ profile, children }) => {
  const { isOpen, close, open } = useModalState();
  const { avatar, username, createdAt } = profile;
  const shortName = username.split(' ')[0];
  const memberSince = new Date(createdAt).toLocaleDateString();
  return (
    <div>
      <Button
        onClick={open}
        appearance="link"
        style={{ textDecoration: 'none', color: 'black' }}
        className="box-sd-none"
      >
        {shortName}
      </Button>
      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>{shortName} profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <ProfileAvatar
            src={avatar}
            name={username}
            className="width-200 height-200 img-fullsize font-huge"
          />
          <h4 className="mt-2 ">{username}</h4>
          <p>Memeber since {memberSince}</p>
        </Modal.Body>
        <Modal.Footer>
          {children}
          <Button block onClick={close}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileInfoBtnModal;
