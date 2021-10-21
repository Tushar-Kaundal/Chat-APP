import React, { memo } from 'react';
import { Button } from 'rsuite';
import TimeAgo from 'timeago-react';
import Heart from '@rsuite/icons/legacy/Heart';
import Close from '@rsuite/icons/legacy/Close';
import { useCurrentRoom } from '../../../context/CurrentRoomContext';
import { auth } from '../../../misc/firebase';
import ProfileAvatar from '../../dashboard/ProfileAvatar';
import PresenceDot from '../../PresenceDot';
import IconBtnControl from './IconBtnControl';
import ProfileInfoBtnModal from './ProfileInfoBtnModal';
import { useHover, useMediaQuery } from '../../../misc/custom-hooks';
import ImgBtnModal from './ImgBtnModal';

const renderFileMessage = file => {
  if (file.contentType.includes('image')) {
    return (
      <div className="height-220">
        <ImgBtnModal src={file.url} fileName={file.name} />
      </div>
    );
  }
  if (file.contentType.includes('audio')) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio controls>
        <source src={file.url} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    );
  }

  return <a href={file.url}>Download {file.name}</a>;
};

const MessageItem = ({ message, handleAdmin, handleLike, handleDelete }) => {
  const { author, createdAt, text, likes, file, likeCount } = message;

  const [selfRef, isHovered] = useHover();
  const isMobile = useMediaQuery('(max-width: 992px)');

  const isAdmin = useCurrentRoom(v => v.isAdmin);
  const admins = useCurrentRoom(v => v.admins);

  const isMsgAuthorAdmin = admins.includes(author.uid);
  const isAuthor = auth.currentUser.uid === author.uid;
  const canGrantAdmin = isAdmin && !isAuthor;

  const canShowIcons = isMobile || isHovered;
  const isLiked = likes && Object.keys(likes).includes(auth.currentUser.uid);

  return (
    <li
      className={`padded mb-1 cursor-pointer ${isHovered ? 'bg-black-02' : ''}`}
      ref={selfRef}
    >
      <div className="d-flex align-items-center font-bolder mb-1">
        <PresenceDot uid={author.uid} />
        <ProfileAvatar
          src={author.avatar}
          name={author.username}
          className="ml-1"
          size="xs"
        />

        <ProfileInfoBtnModal profile={author}>
          {canGrantAdmin && (
            <Button
              block
              onClick={() => handleAdmin(author.uid)}
              color="blue"
              appearance="primary"
            >
              {isMsgAuthorAdmin
                ? 'Remove admin permission'
                : 'Give admin in this room'}
            </Button>
          )}
        </ProfileInfoBtnModal>
        <TimeAgo datetime={createdAt} className="font-normal text-black-45 " />
        <IconBtnControl
          {...(isLiked ? { color: 'red' } : {})}
          {...(isLiked ? { appearance: 'primary' } : {})}
          isVisible={canShowIcons}
          iconName={<Heart />}
          tooltip="Like this message"
          onClick={() => handleLike(message.id)}
          badgeContent={likeCount}
        />
        {isAuthor && (
          <IconBtnControl
            isVisible={canShowIcons}
            iconName={<Close />}
            tooltip="Delete this message"
            onClick={() => handleDelete(message.id, file)}
          />
        )}
      </div>
      <div>
        {text && <span className="word-breal-all">{text}</span>}
        {file && renderFileMessage(file)}
      </div>
    </li>
  );
};

export default memo(MessageItem);
