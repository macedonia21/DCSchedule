import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import TagsInput from 'react-tagsinput';
import { _ } from 'underscore';
import { NotificationManager } from 'react-notifications';
import moment from 'moment/moment';

// import components

// import styles
import './EmployeeUpdate.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class EmployeeUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChanged: false,
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
    Meteor.call('employee.update', user._id, user.profile, (err, res) => {
      if (err) {
        NotificationManager.error(
          `Cannot update: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success(
          'Employee profile is updated',
          'Success',
          3000
        );
        return this.props.history.push('/employee');
      }
    });
  }

  render() {
    const { loggedIn, usersReady, user } = this.props;

    if (!loggedIn) {
      return null;
    }

    return (
      <section className="create-employee-page">
        <div className="card mx-auto" style={{ maxWidth: '80%' }}>
          <div className="card-header">
            <div className="card-body">
              <h1 className="card-title text-center">Employee Profile</h1>
              {usersReady && (
                <form onSubmit={this.handleSubmit}>
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.firstName = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.lastName = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.vnName = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.gender = e.target.value;
                          }}
                          required
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
                          onChange={date => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.joinDate = date;
                          }}
                          dateFormat="MMM dd, yyyy"
                          required
                        />
                      </div>

                      {/* <!-- Talents --> */}
                      <div className="form-group">
                        <label htmlFor="talents">Capabilities</label>
                        <TagsInput
                          id="talents"
                          className="form-control"
                          value={user.profile.talents}
                          maxTags={3}
                          onChange={tags => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.talents = tags;
                          }}
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.posTitle = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.jobLevel = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.base = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.entCode = e.target.value;
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.country = e.target.value;
                          }}
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.empType = e.target.value;
                            if (user.profile.empType === 'Permanent') {
                              user.profile.hPW = 40;
                            }
                          }}
                          required
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.hPW = parseInt(e.target.value);
                          }}
                          required
                          disabled={user.profile.empType === 'Permanent'}
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.costCenter = e.target.value;
                          }}
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.portfolios = e.target.value;
                          }}
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
                          onChange={e => {
                            this.setState({
                              isChanged: true,
                            });
                            user.profile.offering = e.target.value;
                          }}
                          required
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group no-margin">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block mb-2"
                      disabled={!this.state.isChanged}
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

EmployeeUpdate.defaultProps = {
  // users: null, remote example (if using ddp)
  user: null,
};

EmployeeUpdate.propTypes = {
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
})(EmployeeUpdate);
