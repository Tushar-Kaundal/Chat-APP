import React, { memo } from 'react';

import { Link } from 'react-router-dom';
import { ButtonToolbar } from 'rsuite';
import ArrowCircleLeft from '@rsuite/icons/legacy/ArrowCircleLeft';
import { useCurrentRoom } from '../../../context/CurrentRoomContext';
import { useMediaQuery } from '../../../misc/custom-hooks';
import RoomInfoBtnModal from './RoomInfoBtnModal';
import EditRoomBtnDrawer from './EditRoomBtnDrawer';

const Top = () => {
  const name = useCurrentRoom(v => v.name);
  const isAdmin = useCurrentRoom(v => v.isAdmin);
  const isMobile = useMediaQuery('(max-width: 992px)');
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="text-disappear d-flex align-items-center">
          <Link to="/">
            <ArrowCircleLeft
              className={
                isMobile
                  ? 'd-inline-block p-0 mr-2 text-blue link-unstyled'
                  : 'd-none'
              }
              style={{ fontSize: '1.5em' }}
            />
          </Link>
          <span className="text-disapper">{name}</span>
        </h4>
        <ButtonToolbar className="ws-nowrap">
          {isAdmin && <EditRoomBtnDrawer />}
        </ButtonToolbar>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span>todo</span>
        <RoomInfoBtnModal />
      </div>
    </div>
  );
};

export default memo(Top);
