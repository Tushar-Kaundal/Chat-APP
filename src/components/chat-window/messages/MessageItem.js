import React from 'react';
import TimeAgo from 'timeago-react';
import ProfileAvatar from '../../dashboard/ProfileAvatar';
import ProfileInfoBtnModal from './ProfileInfoBtnModal';

const MessageItem = ({ message }) => {
  const { author, createdAt, text } = message;
  return (
    <li className="padded mb-1">
      <div className="d-flex align-items-center font-bolder mb-1">
        <ProfileAvatar src={author.avatar} name={author.username} size="xs" />

        <ProfileInfoBtnModal profile={author} />
        <TimeAgo datetime={createdAt} className="font-normal text-black-45 " />
      </div>
      <div>
        <span className="word-break-all ml-1">{text}</span>
      </div>
    </li>
  );
};

export default MessageItem;
