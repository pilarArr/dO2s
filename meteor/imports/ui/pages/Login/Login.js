/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';


import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import validate from '../../../modules/validate';

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        emailAddress: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
      },
      messages: {
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address correct?',
        },
        password: {
          required: 'Need a password here.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;

    Meteor.loginWithPassword(this.emailAddress.value, this.password.value, (error) => {
      if (error) {
        Bert.alert(error.reason, 'warning');
      } else {
        Bert.alert('Welcome back!', 'success');
        history.push('/projects');
      }
    });
  }

  render() {
    return (<div className="Login">
      <Row>
        <Col xs={12} smOffset={3} sm={6} mdOffset={4} md={4}>
          <h4 className="page-header">Log In</h4>
          <Row><Col xs={12}>
            <OAuthLoginButtons
              services={['facebook', 'google']}
              emailMessage={{
                offset: 100,
                text: 'Log In with an Email Address',
              }}
            />
          </Col></Row>
          <form
            ref={form => (this.form = form)}
            onSubmit={event => event.preventDefault()}
          >
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <input
                type="email"
                name="emailAddress"
                ref={emailAddress => (this.emailAddress = emailAddress)}
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel className="clearfix">
                <span className="pull-left">Password</span>
                <Link className="pull-right" to="/recover-password">Forgot password?</Link>
              </ControlLabel>
              <input
                type="password"
                name="password"
                ref={password => (this.password = password)}
                className="form-control"
              />
            </FormGroup>
            <Button type="submit" bsStyle="success" block>Login</Button>
            <AccountPageFooter>
              <p>{'Don\'t have an account?'} <Link to="/signup">Sign Up</Link>.</p>
            </AccountPageFooter>
          </form>
        </Col>
      </Row>
    </div>
    );
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Login;