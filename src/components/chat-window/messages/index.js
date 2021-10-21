/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  off,
  runTransaction,
  update,
} from 'firebase/database';
import { ref as stgRef, deleteObject } from 'firebase/storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toaster, Message as Mess } from 'rsuite';
import { auth, db, storage } from '../../../misc/firebase';
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

  const handleLike = useCallback(async msgId => {
    const { uid } = auth.currentUser;
    const msgRef = ref(db, `/messages/${msgId}`);

    let alertMsg;

    await runTransaction(msgRef, msg => {
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;
          alertMsg = 'Like removed';
        } else {
          msg.likeCount += 1;

          if (!msg.likes) {
            msg.likes = {};
          }

          msg.likes[uid] = true;
          alertMsg = 'Like added';
        }
      }

      return msg;
    });

    toaster.push(
      <Mess showIcon type="info" duration={4000} closable>
        {alertMsg}
      </Mess>
    );
  }, []);

  const handleDelete = useCallback(
    async (msgId, file) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('Delete this message?')) {
        return;
      }

      const isLast = messages[messages.length - 1].id === msgId;

      const updates = {};

      updates[`/messages/${msgId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await update(ref(db), updates);

        toaster.push(
          <Mess showIcon type="info" duration={2000} closable>
            Message has been deleted
          </Mess>
        );
      } catch (err) {
        return toaster.push(
          <Mess showIcon type="error" duration={2000} closable>
            {err.message}
          </Mess>
        );
      }
      if (file) {
        try {
          const fileRef = stgRef(storage, file.url);
          await deleteObject(fileRef);
        } catch (err) {
          toaster.push(
            <Message type="error" showIcon duration={2000} closable>
              {err.message}
            </Message>
          );
        }
      }
    },
    [chatId, messages]
  );
  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No Messages yet</li>}
      {canShowMessages &&
        messages.map(msg => (
          <MessageItem
            key={msg.id}
            message={msg}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        ))}
    </ul>
  );
};

export default Message;
