import React, { useCallback, useState } from 'react';
import { Input, InputGroup, Message, toaster } from 'rsuite';
import { useParams } from 'react-router';
import Send from '@rsuite/icons/legacy/Send';
import { serverTimestamp, ref, push, update } from 'firebase/database';
import { useProfile } from '../../../context/profile.context';
import { db } from '../../../misc/firebase';
import AttachmentBtnModal from './AttachmentBtnModal';
import AudioMsgBtn from './AudioMsgBtn';

const assembleMessage = (profile, chatId) => {
  return {
    roomId: chatId,
    createdAt: serverTimestamp(),
    author: {
      username: profile.username,
      uid: profile.uid,
      createdAt: profile.createdAt,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
    likeCount: 0,
  };
};

const Bottom = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useProfile();
  const { chatId } = useParams();

  const onInputChange = useCallback(value => {
    setInput(value);
  }, []);

  const onSendClick = async () => {
    if (input.trim() === '') {
      return;
    }

    const msgData = assembleMessage(profile, chatId);
    msgData.text = input;

    const updates = {};

    const messageId = push(ref(db, 'messages')).key;

    updates[`/messages/${messageId}`] = msgData;
    updates[`/rooms/${chatId}/lastMessage`] = {
      ...msgData,
      msgId: messageId,
    };

    setIsLoading(true);
    try {
      await update(ref(db), updates);
      setInput('');
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toaster.push(
        <Message showIcon type="error" closable duration={2000}>
          {err.message}
        </Message>
      );
    }
  };

  const handleKeyDown = ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      onSendClick();
    }
  };

  const afterUpload = useCallback(
    async files => {
      setIsLoading(true);

      const updates = {};

      files.forEach(file => {
        const msgData = assembleMessage(profile, chatId);
        msgData.file = file;

        const messageId = push(ref(db, 'messages')).key;

        updates[`/messages/${messageId}`] = msgData;
      });

      const lastMsgId = Object.keys(updates).pop();

      updates[`/rooms/${chatId}/lastMessage`] = {
        ...updates[lastMsgId],
        msgId: lastMsgId,
      };

      try {
        await update(ref(db), updates);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        toaster.push(
          <Message type="error" showIcon closable duration={2000}>
            {err.message}
          </Message>
        );
      }
    },
    [chatId, profile]
  );

  return (
    <div>
      <InputGroup>
        <AttachmentBtnModal afterUpload={afterUpload} />
        <AudioMsgBtn afterUpload={afterUpload} />
        <Input
          placeholder="write a new message"
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
        />
        <InputGroup.Button
          color="blue"
          appearance="primary"
          onClick={onSendClick}
          disabled={isLoading}
        >
          <Send />
        </InputGroup.Button>
      </InputGroup>
    </div>
  );
};

export default Bottom;
