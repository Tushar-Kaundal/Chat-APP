import React, { useState, useCallback } from 'react';
import { InputGroup, Message, toaster } from 'rsuite';
import { ReactMic } from 'react-mic';
import { useParams } from 'react-router';
import Microphone from '@rsuite/icons/legacy/Microphone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../misc/firebase';

const AudioMsgBtn = ({ afterUpload }) => {
  const { chatId } = useParams();

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onClick = useCallback(() => {
    setIsRecording(p => !p);
  }, []);

  const onUpload = useCallback(
    async data => {
      setIsUploading(true);
      try {
        const uploadRef = ref(storage, `/chat/${chatId}`);
        const chatuploadRef = ref(uploadRef.parent, `audio_${Date.now()}.mp3`);
        const snap = await uploadBytes(chatuploadRef, data.blob, {
          cacheControl: `public, max-age=${3600 * 24 * 3}`,
        });

        const file = {
          contentType: snap.metadata.contentType,
          name: snap.metadata.name,
          url: await getDownloadURL(snap.ref),
        };

        setIsUploading(false);
        afterUpload([file]);
      } catch (error) {
        setIsUploading(false);
        toaster.push(
          <Message type="error" showIcon closable duration={2000}>
            {error.message}
          </Message>
        );
      }
    },
    [afterUpload, chatId]
  );

  return (
    <InputGroup.Button
      onClick={onClick}
      loading={isUploading}
      className={isRecording ? 'animate-blink' : ''}
    >
      <Microphone />
      <ReactMic
        record={isRecording}
        className="d-none"
        onStop={onUpload}
        mimeType="audio/mp3"
      />
    </InputGroup.Button>
  );
};

export default AudioMsgBtn;
