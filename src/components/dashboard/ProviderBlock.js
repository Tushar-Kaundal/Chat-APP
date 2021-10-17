import React, { useState } from 'react';
import { Button, Message, Tag, toaster } from 'rsuite';
import GoogleIcon from '@rsuite/icons/legacy/Google';
import FacebookIcon from '@rsuite/icons/legacy/Facebook';
import {
  unlink,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithPopup,
} from 'firebase/auth';
import { auth } from '../../misc/firebase';

const ProviderBlock = () => {
  console.log('user', auth.currentUser);
  const [isConnected, setIsConnected] = useState({
    'google.com': auth.currentUser.providerData.some(
      data => data.providerId === 'google.com'
    ),
    'facebook.com': auth.currentUser.providerData.some(
      data => data.providerId === 'faceboook.com'
    ),
  });

  const updateIsConnected = (providerId, value) => {
    setIsConnected(p => {
      return {
        ...p,
        [providerId]: value,
      };
    });
  };

  const Unlink = async providerId => {
    try {
      if (auth.currentUser.providerData.length === 1) {
        throw new Error(`You can not disconnect from ${providerId}`);
      }
      await unlink(auth.currentUser, providerId);
      updateIsConnected(providerId, false);
      toaster.push(
        <Message showIcon type="info" duration={2000}>
          {`Disconnected from ${providerId}`}
        </Message>
      );
    } catch (err) {
      toaster.push(
        <Message showIcon type="error" duration="2000">
          {err.message}
        </Message>
      );
    }
  };

  const link = async provider => {
    try {
      await linkWithPopup(auth.currentUser, provider);
      toaster.push(
        <Message showIcon type="info" duration={2000}>
          {`Linked to ${provider.providerId}`}
        </Message>
      );
      updateIsConnected(provider.providerId, true);
    } catch (error) {
      toaster.push(
        <Message showIcon type="error" duration={2000}>
          {error.message}
        </Message>
      );
    }
  };

  const unlinkFacebook = () => {
    Unlink('facebook.com');
  };
  const unlinkGoogle = () => {
    Unlink('google.com');
  };
  const linkFacebook = () => {
    link(new FacebookAuthProvider());
  };
  const linkGoogle = () => {
    link(new GoogleAuthProvider());
  };

  return (
    <div>
      {isConnected['google.com'] && (
        <Tag closable color="green" onClose={unlinkGoogle}>
          <GoogleIcon style={{ marginTop: '-4px' }} /> Connected
        </Tag>
      )}
      {isConnected['facebook.com'] && (
        <Tag closable color="blue" onClose={unlinkFacebook}>
          <FacebookIcon /> Connected
        </Tag>
      )}
      <div className="mt-2">
        {!isConnected['google.com'] && (
          <Button block color="green" appearance="primary" onClick={linkGoogle}>
            <GoogleIcon style={{ marginTop: '-4px' }} /> Link to Google
          </Button>
        )}
        {!isConnected['facebook.com'] && (
          <Button
            block
            color="blue"
            appearance="primary"
            onClick={linkFacebook}
          >
            <FacebookIcon /> Link to Facebook
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProviderBlock;
