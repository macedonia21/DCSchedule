import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import TagsInput from 'react-tagsinput';
import { _ } from 'underscore';
import { NotificationManager } from 'react-notifications';
import { Accounts } from 'meteor/accounts-base';

// collection

// components

// styles
import './Profile.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPass: '',
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
    const { oldPass, newPass, retypeNewPass } = this.state;

    if (newPass === oldPass) {
      NotificationManager.error(
        'Cannot change password: New password must different from current password',
        'Error',
        3000
      );
      return;
    }

    if (newPass !== retypeNewPass) {
      NotificationManager.error(
        'Cannot change password: Confirm password not correct',
        'Error',
        3000
      );
      return;
    }

    Accounts.changePassword(oldPass, newPass, err => {
      if (err) {
        NotificationManager.error(
          `Cannot change password: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success(
          'Your password is changed, logout in few seconds',
          'Success',
          3000
        );
        setTimeout(() => {
          Meteor.logout(() => {
            this.props.history.push('/');
          });
        }, 3000);
      }
    });
  }

  render() {
    const { loggedIn, usersReady, user } = this.props;
    const { oldPass, newPass, retypeNewPass } = this.state;

    if (!loggedIn) {
      return null;
    }

    return (
      <section className="profile-page">
        <div className="card mx-auto" style={{ maxWidth: '80%' }}>
          <div className="card-header">
            <div className="card-body">
              <h1
                className="card-title text-center dropdown-toggle"
                data-toggle="collapse"
                href="#collapseProfile"
                aria-expanded="false"
                aria-controls="collapseProfile"
              >
                Employee Profile
              </h1>
              <div className="collapse" id="collapseProfile">
                {usersReady && (
                  <form>
                    <div className="row">
                      {/* <!-- First Col --> */}
                      <div className="col-md-4">
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

                        {/* <!-- Password --> */}
                        <div className="form-group">
                          <label htmlFor="password">Password</label>
                          <input
                            id="password"
                            type="password"
                            className="form-control"
                            name="password"
                            value=""
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- First Name --> */}
                        <div className="form-group">
                          <label htmlFor="firstname">First Name</label>
                          <input
                            id="firstname"
                            type="text"
                            className="form-control"
                            name="firstname"
                            value={user.profile.firstName}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Last Name --> */}
                        <div className="form-group">
                          <label htmlFor="lastname">Last Name</label>
                          <input
                            id="lastname"
                            type="text"
                            className="form-control"
                            name="lastname"
                            value={user.profile.lastName}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- VN Name --> */}
                        <div className="form-group">
                          <label htmlFor="vnname">Vietnamese Name</label>
                          <input
                            id="vnname"
                            type="text"
                            className="form-control"
                            name="vnname"
                            value={user.profile.vnName}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Gender --> */}
                        <div className="form-group">
                          <label htmlFor="gender">Gender</label>
                          <select
                            id="gender"
                            type="text"
                            className="form-control"
                            name="gender"
                            defaultValue={user.profile.gender}
                            required
                            disabled
                          >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        </div>
                      </div>

                      {/* <!-- Second Col --> */}
                      <div className="col-md-4">
                        {/* <!-- Join Date --> */}
                        <div className="form-group">
                          <label htmlFor="joindate">Join Date</label>
                          <DatePicker
                            className="form-control"
                            selected={user.profile.joinDate}
                            dateFormat="MMM dd, yyyy"
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Talents --> */}
                        <div className="form-group">
                          <label htmlFor="talents">Capabilities</label>
                          <TagsInput
                            id="talents"
                            className="form-control form-control-disabled"
                            value={user.profile.talents}
                            maxTags={3}
                            disabled
                          />
                        </div>

                        {/* <!-- Position Title --> */}
                        <div className="form-group">
                          <label htmlFor="postitle">Position Title</label>
                          <select
                            id="postitle"
                            type="text"
                            className="form-control"
                            name="postitle"
                            defaultValue={user.profile.posTitle}
                            required
                            disabled
                          >
                            <option value="BA">Business Analysis</option>
                            <option value="C">Consultant</option>
                            <option value="SC">Senior Consultant</option>
                            <option value="M">Manager</option>
                            <option value="SM">Senior Manager</option>
                          </select>
                        </div>

                        {/* <!-- Job Level --> */}
                        <div className="form-group">
                          <label htmlFor="joblevel">Job Level</label>
                          <input
                            id="joblevel"
                            type="text"
                            className="form-control"
                            name="joblevel"
                            value={user.profile.jobLevel}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Base --> */}
                        <div className="form-group">
                          <label htmlFor="base">Base</label>
                          <select
                            id="base"
                            type="text"
                            className="form-control"
                            name="base"
                            defaultValue={user.profile.base}
                            required
                            disabled
                          >
                            <option value="HCM">Ho Chi Minh</option>
                            <option value="HN">Ha Noi</option>
                          </select>
                        </div>

                        {/* <!-- Entity Code --> */}
                        <div className="form-group">
                          <label htmlFor="entcode">Entity Code</label>
                          <select
                            id="entcode"
                            type="text"
                            className="form-control"
                            name="entcode"
                            defaultValue={user.profile.entCode}
                            required
                            disabled
                          >
                            <option value="VN1C">VN1C</option>
                            <option value="VN2C">VN2C</option>
                          </select>
                        </div>
                      </div>

                      {/* <!-- Third Col --> */}
                      <div className="col-md-4">
                        {/* <!-- Country --> */}
                        <div className="form-group">
                          <label htmlFor="country">Country</label>
                          <select
                            id="country"
                            type="text"
                            className="form-control"
                            name="country"
                            defaultValue={user.profile.country}
                            required
                            disabled
                          >
                            <option value="Brunei">Brunei</option>
                            <option value="Guam">Guam</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Vietnam">Vietnam</option>
                          </select>
                        </div>

                        {/* <!-- Employment Type --> */}
                        <div className="form-group">
                          <label htmlFor="emptype">Employment Type</label>
                          <select
                            id="emptype"
                            type="text"
                            className="form-control"
                            name="emptype"
                            defaultValue={user.profile.empType}
                            required
                            disabled
                          >
                            <option value="Permanent">Permanent</option>
                            <option value="Contractor">Contractor</option>
                          </select>
                        </div>

                        {/* <!-- Hours Per Week --> */}
                        <div className="form-group">
                          <label htmlFor="hpw">Hours Per Week</label>
                          <input
                            id="hpw"
                            type="number"
                            max={40}
                            min={0}
                            className="form-control"
                            name="hpw"
                            value={user.profile.hPW || 0}
                            disabled
                          />
                        </div>

                        {/* <!-- Cost Center --> */}
                        <div className="form-group">
                          <label htmlFor="costcenter">Cost Center</label>
                          <input
                            id="costcenter"
                            type="text"
                            className="form-control"
                            name="costcenter"
                            value={user.profile.costCenter}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Portfolios --> */}
                        <div className="form-group">
                          <label htmlFor="portfolios">Portfolios</label>
                          <input
                            id="portfolios"
                            type="text"
                            className="form-control"
                            name="portfolios"
                            value={user.profile.portfolios}
                            required
                            disabled
                          />
                        </div>

                        {/* <!-- Offering --> */}
                        <div className="form-group">
                          <label htmlFor="offering">Offering</label>
                          <input
                            id="offering"
                            type="text"
                            className="form-control"
                            name="offering"
                            value={user.profile.offering}
                            required
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
              <hr />
              <h1 className="card-title text-center">Update Password</h1>
              {usersReady && (
                <form onSubmit={this.handleSubmit}>
                  <div className="row">
                    {/* <!-- First Col --> */}
                    <div className="col-md-4">
                      {/* <!-- Old Password --> */}
                      <div className="form-group">
                        <label htmlFor="oldpassword">Old Password</label>
                        <input
                          id="oldpassword"
                          type="password"
                          className="form-control"
                          name="oldpassword"
                          value={oldPass}
                          onChange={e =>
                            this.setState({ oldPass: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* <!-- Second Col --> */}
                    <div className="col-md-4">
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
                    </div>

                    {/* <!-- Third Col --> */}
                    <div className="col-md-4">
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
                      Update
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

Profile.defaultProps = {
  // users: null, remote example (if using ddp)
  user: null,
};

Profile.propTypes = {
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
  const user = _.findWhere(users, { _id: Meteor.userId() });
  const usersReady = usersSub.ready() && !!users;

  return {
    usersReady,
    user,
  };
})(Profile);
