/* eslint-disable no-underscore-dangle */
import Facebook from '@rsuite/icons/legacy/Facebook';
import Google from '@rsuite/icons/legacy/Google';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import React from 'react';
import {
  Button,
  Col,
  Container,
  Grid,
  Message,
  Panel,
  Row,
  toaster,
} from 'rsuite';
import { auth, db } from '../misc/firebase';

const SingIn = () => {
  const signInWithProvider = async provider => {
    try {
      const { user, isNewUser } = await signInWithPopup(auth, provider).then(
        results => {
          return {
            isNewUser: getAdditionalUserInfo(results).isNewUser,
            user: results.user,
            _tokenResponse: results._tokenResponse,
          };
        }
      );
      if (isNewUser) {
        await set(ref(db, `/profiles/${user.uid}`), {
          username: user.displayName,
          createdAt: serverTimestamp(),
        });
      }
      toaster.push(
        <Message type="success" duration={4000}>
          Signed in
        </Message>
      );
    } catch (err) {
      toaster.push(
        <Message type="info" duration={4000}>
          {err.message}
        </Message>
      );
    }
  };
  const onFacebookSignIn = () => {
    signInWithProvider(new FacebookAuthProvider());
  };
  const onGoogleSignIN = () => {
    signInWithProvider(new GoogleAuthProvider());
  };
  return (
    <Container>
      <Grid className="mt-page">
        <Row>
          <Col xs={24} md={12} mdOffset={6}>
            <Panel>
              <div className="text-center">
                <h2>Welcome to Chat</h2>
                <p>Progressive chat platform for neophytes</p>
              </div>
              <div className="mt-3">
                <Button
                  block
                  color="blue"
                  appearance="primary"
                  onClick={onFacebookSignIn}
                >
                  <Facebook /> Continue with Facebook
                </Button>
                <Button
                  block
                  color="red"
                  appearance="primary"
                  onClick={onGoogleSignIN}
                >
                  <Google /> Continue with Google
                </Button>
              </div>
            </Panel>
          </Col>
        </Row>
      </Grid>
    </Container>
  );
};

export default SingIn;
