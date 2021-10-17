import { ref as stgref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbref, set, child } from 'firebase/database';
import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button, Message, Modal, toaster } from 'rsuite';
import ModalBody from 'rsuite/esm/Modal/ModalBody';
import ModalFooter from 'rsuite/esm/Modal/ModalFooter';
import ModalHeader from 'rsuite/esm/Modal/ModalHeader';
import ModalTitle from 'rsuite/esm/Modal/ModalTitle';
import { useProfile } from '../../context/profile.context';
import { useModalState } from '../../misc/custom-hooks';
import { db, storage } from '../../misc/firebase';
import ProfileAvatar from './ProfileAvatar';

const fileInputTypes = '.png, .jpeg, .jpg';
const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
const isValidFile = file => {
  return acceptedFileTypes.includes(file.type);
};
const getBlob = canvas => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('File process error'));
      }
    });
  });
};

const AvatarUploadBtn = () => {
  const { isOpen, open, close } = useModalState();
  const { profile } = useProfile();
  const [img, setImg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const avatarEditorRef = useRef();

  const onFileInputChange = ev => {
    const currFiles = ev.target.files;
    if (currFiles.length === 1) {
      const file = currFiles[0];
      if (isValidFile(file)) {
        setImg(file);
        open();
      } else {
        toaster.push(
          <Message showIcon type="warning" closable duration={2000}>
            {`Wrong file type ${file.type}`}
          </Message>
        );
      }
    }
  };

  const onUploadClick = async () => {
    const canvas = avatarEditorRef.current.getImageScaledToCanvas();
    setIsLoading(true);
    try {
      const blob = await getBlob(canvas);
      const profileRef = stgref(storage, `/profile/${profile.uid}`);
      const avatarFileRef = stgref(profileRef.parent, `avatar`);
      const uploadAvatarResult = await uploadBytes(avatarFileRef, blob, {
        cacheControl: `public, max-age=${3600 * 24 * 3}`,
      });
      const downloadUrl = await getDownloadURL(uploadAvatarResult.ref);
      const userAvatarRef = child(
        dbref(db, `/profiles/${profile.uid}`),
        'avatar'
      );
      set(userAvatarRef, downloadUrl);
      setIsLoading(false);
      toaster.push(
        <Message showIcon type="info" closable duration={2000}>
          Avatar has been uploaded
        </Message>
      );
    } catch (err) {
      setIsLoading(false);

      toaster.push(
        <Message showIcon type="error" closable duration={2000}>
          {err.message}
        </Message>
      );
    }
  };

  return (
    <div className="mt-3 text-center">
      <ProfileAvatar
        src={profile.avatar}
        name={profile.username}
        className="width-200 height-200 img-fullsize font-huge"
      />
      <div>
        <label
          htmlFor="avatar-upload"
          className="d-block cursor-pointer padded"
        >
          Select new avatar
          <input
            id="avatar-upload"
            type="file"
            className="d-none"
            accept={fileInputTypes}
            onChange={onFileInputChange}
          />
        </label>
        <Modal open={isOpen} onClose={close}>
          <ModalHeader>
            <ModalTitle>Adjust and Upload new avatar</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="d-flex justify-content-center align-items-center h-100">
              {img && (
                <AvatarEditor
                  ref={avatarEditorRef}
                  image={img}
                  width={200}
                  height={200}
                  border={10}
                  borderRadius={100}
                  rotate={0}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              block
              appearance="ghost"
              onClick={onUploadClick}
              disabled={isLoading}
            >
              Upload new avatar
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default AvatarUploadBtn;
