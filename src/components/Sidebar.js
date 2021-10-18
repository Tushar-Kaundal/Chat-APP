import React from 'react';
import CreateRoomBtnModal from './CreateRoomBtnModal';

import DashBoardToggle from './dashboard/DashBoardToggle';

const Sidebar = () => {
  return (
    <div className="h-100 pt-2">
      <div>
        <DashBoardToggle />
        <CreateRoomBtnModal />
      </div>
      bottom
    </div>
  );
};

export default Sidebar;
