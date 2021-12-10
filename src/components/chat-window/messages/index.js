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
  limitToLast,
} from 'firebase/database';
import { ref as stgRef, deleteObject } from 'firebase/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { toaster, Message as Mess, Button } from 'rsuite';
import { auth, db, storage } from '../../../misc/firebase';
import { groupBy, tramsformToArrWidthId } from '../../../misc/helper';
import MessageItem from './MessageItem';

const messageRef = ref(db, '/messages');
const PAGE_SIZE = 15;

function shouldScrollToBottom(node, threshold = 30) {
  const percentage =
    (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;

  return percentage > threshold;
}

const Message = () => {
  const { chatId } = useParams();
  const [messages, setMessage] = useState([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  const loadMessages = useCallback(
    limitLast => {
      const node = selfRef.current;
      off(messageRef);
      onValue(
        query(
          messageRef,
          orderByChild('roomId'),
          equalTo(chatId),
          limitToLast(limitLast || PAGE_SIZE)
        ),
        snap => {
          const data = tramsformToArrWidthId(snap.val());

          setMessage(data);

          if (shouldScrollToBottom(node)) {
            node.scrollTop = node.scrollHeight;
          }
        }
      );
      setLimit(p => p + PAGE_SIZE);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;
    loadMessages(limit);
    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 200);
  }, [loadMessages, limit]);

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();

    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);

    return () => {
      off(messageRef, 'value');
    };
  }, [loadMessages]);

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
  const renderMessages = () => {
    const groups = groupBy(messages, item =>
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach(date => {
      items.push(
        <li key={date} className="text-center mb-1 padded">
          {date}
        </li>
      );

      const msgs = groups[date].map(msg => (
        <MessageItem
          key={msg.id}
          message={msg}
          handleAdmin={handleAdmin}
          handleLike={handleLike}
          handleDelete={handleDelete}
        />
      ));

      items.push(...msgs);
    });

    return items;
  };
  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= PAGE_SIZE && (
        <li className="text-center mt-2 mb-2">
          <Button onClick={onLoadMore} color="green" appearance="primary">
            Load more
          </Button>
        </li>
      )}
      {isChatEmpty && <li>No Messages yet</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Message;
