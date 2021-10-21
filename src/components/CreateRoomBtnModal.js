import React, { useCallback, useRef, useState } from 'react';
import { Button, Form, Input, Message, Modal, Schema, toaster } from 'rsuite';
import Creative from '@rsuite/icons/legacy/Creative';
import { serverTimestamp, ref, push } from 'firebase/database';
import { useModalState } from '../misc/custom-hooks';
import { auth, db } from '../misc/firebase';

const Textarea = React.forwardRef((props, Ref) => (
  <Input {...props} as="textarea" ref={Ref} />
));

const { StringType } = Schema.Types;
const model = Schema.Model({
  name: StringType().isRequired('Chat name is required'),
  description: StringType().isRequired('Description is required'),
});

const INITIAL_FORM = {
  name: '',
  description: '',
};

const CreateRoomBtnModal = () => {
  const { isOpen, open, close } = useModalState();
  const [formValue, setFormValue] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const onFormChange = useCallback(value => {
    setFormValue(value);
  }, []);

  const onSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    }
    setIsLoading(true);

    const newRoomdata = {
      ...formValue,
      createdAt: serverTimestamp(),
      admins: {
        [auth.currentUser.uid]: true,
      },
    };

    try {
      await push(ref(db, `rooms`), newRoomdata);
      toaster.push(
        <Message showIcon type="info" duration={2000} closable>
          {`${formValue.name} has been created`}
        </Message>
      );
      setIsLoading(false);
      setFormValue(INITIAL_FORM);
      close();
    } catch (err) {
      setIsLoading(false);
      toaster.push(
        <Message showIcon type="error" closable duration={2000}>
          {err.message}
        </Message>
      );
    }
  };

  return (
    <div className="mt-1">
      <Button block color="green" appearance="primary" onClick={open}>
        <Creative /> Creative new chat room
      </Button>
      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>New Chat room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            onChange={onFormChange}
            formValue={formValue}
            model={model}
            ref={formRef}
          >
            <Form.Group>
              <Form.ControlLabel>Room Name</Form.ControlLabel>
              <Form.Control name="name" placeholder="Enter chat room name..." />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>
                <Form.Control
                  rows={5}
                  name="description"
                  placeholder="Enter chat room now..."
                  accepter={Textarea}
                />
              </Form.ControlLabel>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            block
            appearance="primary"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Create new chat room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
