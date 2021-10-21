/* eslint-disable no-param-reassign */
import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  off,
  runTransaction,
} from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toaster, Message as Mess } from 'rsuite';
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

  const handleAdmin = useCallback(
    async uid => {
      const adminsRef = ref(db, `/rooms/${chatId}/admins`);

      let alertMsg;

      await runTransaction(adminsRef, admins => {
        if (admins) {
          if (admins[uid]) {
            admins[uid] = null;
            alertMsg = 'Admin permission removed';
          } else {
            admins[uid] = true;
            alertMsg = 'Admin permission granted';
          }
        }

        return admins;
      });

      toaster.push(
        <Mess showIcon type="info" duration={4000} closable>
          {alertMsg}
        </Mess>
      );
    },
    [chatId]
  );

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No Messages yet</li>}
      {canShowMessages &&
        messages.map(msg => (
          <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} />
        ))}
    </ul>
  );
};

export default Message;
