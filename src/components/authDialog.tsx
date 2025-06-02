import React, { useState } from 'react';
import { Modal, TextInput, Button } from '@carbon/react';
import { type AuthDialogProps } from '../types';

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, onAuth, credentialsProvided }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    await onAuth(email, password);
    setEmail('');
    setPassword('');
  };

  return (
    <Modal
      open={open}
      modalHeading="Authenticate with the NDR"
      primaryButtonText="Submit"
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
    >
      {!credentialsProvided && (
        <>
          <TextInput
            id="email"
            labelText="NDR Login Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            id="password"
            labelText="NDR Login Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: '1rem' }}
          />
        </>
      )}
    </Modal>
  );
};

export default AuthDialog;
