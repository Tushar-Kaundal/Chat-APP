import React, { useState } from 'react';
import { useParams } from 'react-router';
import { InputGroup, Modal, Button, Uploader, toaster, Message } from 'rsuite';
import Attachment from '@rsuite/icons/legacy/Attachment';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useModalState } from '../../../misc/custom-hooks';
import { storage } from '../../../misc/firebase';

const MAX_FILE_SIZE = 1000 * 1024 * 5;

const AttachmentBtnModal = ({ afterUpload }) => {
  const { chatId } = useParams();
  const { isOpen, close, open } = useModalState();

  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = fileArr => {
    const filtered = fileArr
      .filter(el => el.blobFile.size <= MAX_FILE_SIZE)
      .slice(0, 5);

    setFileList(filtered);
  };

  const onUpload = async () => {
    try {
      const uploadPromises = fileList.map(f => {
        const uploadRef = ref(storage, `/chat/${chatId}`);
        const chatuploadRef = ref(uploadRef.parent, Date.now() + f.name);
        return uploadBytes(chatuploadRef, f.blobFile, {
          cacheControl: `public, max-age=${3600 * 24 * 3}`,
        });
      });

      const uploadSnapshots = await Promise.all(uploadPromises);

      const shapePromises = uploadSnapshots.map(async snap => {
        return {
          contentType: snap.metadata.contentType,
          name: snap.metadata.name,
          url: await getDownloadURL(snap.ref),
        };
      });

      const files = await Promise.all(shapePromises);

      await afterUpload(files);

      setIsLoading(false);
      close();
    } catch (err) {
      setIsLoading(false);
      toaster.push(
        <Message type="error" showIcon closable duration={2000}>
          {err.message}
        </Message>
      );
    }
  };

  return (
    <>
      <InputGroup.Button onClick={open}>
        <Attachment />
      </InputGroup.Button>
      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>Upload files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Uploader
            autoUpload={false}
            action=""
            fileList={fileList}
            onChange={onChange}
            multiple
            listType="picture-text"
            className="w-100"
            disabled={isLoading}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button block loading={isLoading} onClick={onUpload}>
            Send to chat
          </Button>
          <div className="text-right mt-2">
            <small>* only files less than 5 mb are allowed</small>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttachmentBtnModal;
