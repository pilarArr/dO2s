/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';

const sendVerificationEmail = (emailAddress) => {
  Meteor.call('users.sendVerificationEmail', Meteor.userId(), (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert(`Verification sent to ${emailAddress}!`, 'success');
    }
  });
};

const verifyEmailAlert = emailAddress => (
  <Alert bsStyle="warning">
    <p>Hey friend! Can you <strong>verify your email address</strong> ({emailAddress}) for us?
      <Button
        bsStyle="link"
        onClick={() => sendVerificationEmail(emailAddress)}
        href="#"
      >
    Re-send verification email
      </Button>
    </p>
  </Alert>);

const Authenticated = ({
  authenticated, component, emailVerified, emailAddress, path, exact, ...rest
}) => (
  <Route
    path={path}
    exact={exact}
    render={(props) => {
      const emailVerifiedComponent = emailVerified
        ? React.createElement(component, {
          ...props, ...rest, authenticated, emailVerified, emailAddress,
        })
        : verifyEmailAlert(emailAddress);

      return authenticated ? emailVerifiedComponent : <Redirect to="/login" />;
    }}
  />
);

Authenticated.defaultProps = {
  emailAddress: '',
};

Authenticated.propTypes = {
  path: PropTypes.string.isRequired,
  exact: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  emailAddress: PropTypes.string,
  emailVerified: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};

export default Authenticated;
