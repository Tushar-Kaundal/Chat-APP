import React, { memo } from 'react';
import { Button, Drawer, toaster, Message } from 'rsuite';
import { useParams } from 'react-router';
import { set, ref, child } from '@firebase/database';
import { useModalState, useMediaQuery } from '../../../misc/custom-hooks';
import EditableInput from '../../dashboard/EditableInput';
import { useCurrentRoom } from '../../../context/CurrentRoomContext';
import { db } from '../../../misc/firebase';

const EditRoomBtnDrawer = () => {
  const { isOpen, open, close } = useModalState();
  const { chatId } = useParams();
  const isMobile = useMediaQuery('(max-width: 992px)');

  const name = useCurrentRoom(v => v.name);
  const description = useCurrentRoom(v => v.description);

  const updateData = (key, value) => {
    set(child(ref(db, `rooms/${chatId}`), key), value)
      .then(() => {
        toaster.push(
          <Message showIcon type="success" duration={4000} closable>
            Successfully Updated
          </Message>
        );
      })
      .catch(err => {
        toaster.push(
          <Message showIcon type="error" duration={4000} closable>
            S{err.message}
          </Message>
        );
      });
  };

  const onNameSave = newName => {
    updateData('name', newName);
  };

  const onDescriptionSave = newDesc => {
    updateData('description', newDesc);
  };

  return (
    <div>
      <Button
        className="br-circle"
        size="sm"
        color="red"
        onClick={open}
        appearance="primary"
      >
        A
      </Button>

      <Drawer full={isMobile} open={isOpen} onClose={close} placement="right">
        <Drawer.Header>
          <Drawer.Title>Edit Room</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <EditableInput
            initialValue={name}
            onSave={onNameSave}
            label={<h6 className="mb-2">Name</h6>}
            emptyMsg="Name can not be empty"
          />
          <EditableInput
            as="textarea"
            rows={5}
            initialValue={description}
            onSave={onDescriptionSave}
            emptyMsg="Description can not be empty"
            wrapperClassName="mt-3"
          />
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default memo(EditRoomBtnDrawer);
