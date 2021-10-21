import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  off,
} from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { db } from '../../../misc/firebase';
import { tramsformToArrWidthId } from '../../../misc/helper';
import MessageItem from './MessageItem';

const Message = () => {
  const { chatId } = useParams();
  const [messages, setMessage] = useState([]);

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messageRef = ref(db, '/messages');
    onValue(
      query(messageRef, orderByChild('roomId'), equalTo(chatId)),
      snap => {
        const data = tramsformToArrWidthId(snap.val());

        setMessage(data);
      }
    );
    return () => {
      off(messageRef, 'value');
    };
  }, [chatId]);

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No Messages yet</li>}
      {canShowMessages &&
        messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
    </ul>
  );
};

export default Message;
