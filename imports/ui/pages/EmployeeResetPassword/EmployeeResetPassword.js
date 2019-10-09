import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import { _ } from 'underscore';
import { NotificationManager } from 'react-notifications';
import { Roles } from 'meteor/alanning:roles';

// collection

// components

// styles
import './EmployeeResetPassword.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class EmployeeResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginRoles: {
        admin: false,
        projMan: false,
      },
      newPass: '',
      retypeNewPass: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    if (!this.props.loggedIn && !Meteor.userId) {
      return this.props.history.push('/login');
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.loggedIn && !Meteor.userId) {
      nextProps.history.push('/login');
      return false;
    }
    return true;
  }

  handleSubmit(e) {
    e.preventDefault();
    const { user } = this.props;
    const { newPass, retypeNewPass } = this.state;

    if (newPass !== retypeNewPass) {
      NotificationManager.error(
        'Cannot change password: Confirm password not correct',
        'Error',
        3000
      );
      return;
    }

    Meteor.call('employee.setPassword', user._id, newPass, err => {
      if (err) {
        NotificationManager.error(
          `Cannot change password: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success(
          'Password changed successfully',
          'Success',
          3000
        );
        this.setState({
          newPass: '',
          retypeNewPass: '',
        });
      }
    });
  }

  render() {
    const { loggedIn, usersReady, user } = this.props;
    const { loginRoles, newPass, retypeNewPass } = this.state;

    if (!loggedIn) {
      return null;
    }

    if (Meteor.userId()) {
      if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
        loginRoles.admin = true;
      }
      if (Roles.userIsInRole(Meteor.userId(), 'projman')) {
        loginRoles.projMan = true;
      }
    }

    return (
      <section className="profile-page">
        <div className="card mx-auto" style={{ maxWidth: '28rem' }}>
          <div className="card-header">
            <div className="card-body">
              <h1 className="card-title text-center">Reset Password</h1>
              {!loginRoles.admin && (
                <h4 className="text-center text-danger">
                  You are not authorized to reset Password
                </h4>
              )}
              {usersReady && loginRoles.admin && (
                <form onSubmit={this.handleSubmit}>
                  <div className="row">
                    <div className="col-md-12">
                      {/* <!-- Email --> */}
                      <div className="form-group">
                        <label htmlFor="email">E-Mail Address</label>
                        <input
                          id="email"
                          type="email"
                          className="form-control"
                          name="email"
                          value={user.profile.email}
                          required
                          disabled
                        />
                      </div>

                      {/* <!-- Full Name --> */}
                      <div className="form-group">
                        <label htmlFor="fullname">Full Name</label>
                        <input
                          id="fullname"
                          type="text"
                          className="form-control"
                          name="fullname"
                          value={user.profile.fullName}
                          required
                          disabled
                        />
                      </div>

                      {/* <!-- New Password --> */}
                      <div className="form-group">
                        <label htmlFor="newpassword">New Password</label>
                        <input
                          id="newpassword"
                          type="password"
                          className="form-control"
                          name="newpassword"
                          value={newPass}
                          onChange={e =>
                            this.setState({ newPass: e.target.value })
                          }
                          required
                        />
                      </div>

                      {/* <!-- Retype New Password --> */}
                      <div className="form-group">
                        <label htmlFor="newpasswordre">
                          Retype New Password
                        </label>
                        <input
                          id="newpasswordre"
                          type="password"
                          className="form-control"
                          name="newpasswordre"
                          value={retypeNewPass}
                          onChange={e =>
                            this.setState({ retypeNewPass: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group no-margin">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block mb-2"
                    >
                      Reset Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

EmployeeResetPassword.defaultProps = {
  // users: null, remote example (if using ddp)
  user: null,
};

EmployeeResetPassword.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  usersReady: PropTypes.bool.isRequired,
  user: PropTypes.objectOf(Meteor.user),
};

export default withTracker(props => {
  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const user = _.findWhere(users, { _id: props.match.params._id });
  const usersReady = usersSub.ready() && !!users;

  return {
    usersReady,
    user,
  };
})(EmployeeResetPassword);
