import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import TagsInput from 'react-tagsinput';
import { NotificationManager } from 'react-notifications';

// import components

// import styles
import './EmployeeCreate.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class CreateEmployee extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      profile: {
        firstName: '',
        lastName: '',
        vnName: '',
        entCode: 'VN1C',
        country: 'Vietnam',
        joinDate: new Date(),
        base: 'HCM',
        empType: 'Permanent',
        indicator: '',
        indAlignment: '',
        costCenter: 'TI:SAP Solutions',
        portfolios: 'Enterprise Technology and Performance',
        offering: 'SAP',
        posTitle: 'C',
        jobLevel: 'C',
        gender: 'M',
        talents: [],
      },
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
    const { email, password, profile } = this.state;
    Meteor.call('create.employee', email, password, profile, (err, res) => {
      if (err) {
        NotificationManager.error(
          `Cannot create: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success('New employee is created', 'Success', 3000);
        return this.props.history.push('/employee');
      }
    });
  }

  render() {
    const { loggedIn } = this.props;
    const { email, password, profile } = this.state;

    if (!loggedIn) {
      return null;
    }

    return (
      <section className="create-employee-page">
        <div className="card mx-auto" style={{ maxWidth: '80%' }}>
          <div className="card-header">
            <div className="card-body">
              <h1 className="card-title text-center">Create Employee</h1>
              <form onSubmit={this.handleSubmit}>
                {/* <!-- First Col --> */}
                <div className="row">
                  <div className="col-md-4">
                    {/* <!-- Email --> */}
                    <div className="form-group">
                      <label htmlFor="email">E-Mail Address</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        name="email"
                        value={email}
                        onChange={e => this.setState({ email: e.target.value })}
                        required
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
                        value={password}
                        onChange={e =>
                          this.setState({ password: e.target.value })
                        }
                        required
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
                        value={profile.firstName}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              firstName: e.target.value,
                            },
                          })
                        }
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
                        value={profile.lastName}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              lastName: e.target.value,
                            },
                          })
                        }
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
                        value={profile.vnName}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              vnName: e.target.value,
                            },
                          })
                        }
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
                        defaultValue={profile.gender}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              gender: e.target.value,
                            },
                          })
                        }
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
                        selected={profile.joinDate}
                        onChange={date =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              joinDate: date,
                            },
                          })
                        }
                        dateFormat="MMM dd, yyyy"
                      />
                    </div>

                    {/* <!-- Talents --> */}
                    <div className="form-group">
                      <label htmlFor="talents">Capabilities</label>
                      <TagsInput
                        id="talents"
                        className="form-control"
                        value={profile.talents}
                        onChange={tags =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              talents: tags,
                            },
                          })
                        }
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
                        defaultValue={profile.posTitle}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              posTitle: e.target.value,
                            },
                          })
                        }
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
                      <select
                        id="joblevel"
                        type="text"
                        className="form-control"
                        name="joblevel"
                        defaultValue={profile.jobLevel}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              jobLevel: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="BA">Business Analysis</option>
                        <option value="C">Consultant</option>
                        <option value="SC">Senior Consultant</option>
                        <option value="M">Manager</option>
                        <option value="SM">Senior Manager</option>
                      </select>
                    </div>

                    {/* <!-- Base --> */}
                    <div className="form-group">
                      <label htmlFor="base">Base</label>
                      <select
                        id="base"
                        type="text"
                        className="form-control"
                        name="base"
                        defaultValue={profile.base}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              base: e.target.value,
                            },
                          })
                        }
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
                        defaultValue={profile.entCode}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              entCode: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="VN1C">VN1C</option>
                        <option value="VN1C">VN2C</option>
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
                        defaultValue={profile.country}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              country: e.target.value,
                            },
                          })
                        }
                        required
                        disabled
                      >
                        <option value="Thailand">Thailand</option>
                        <option value="Vietnam">Vietnam</option>
                      </select>
                    </div>

                    {/* <!-- Employment Type --> */}
                    <div className="form-group">
                      <label htmlFor="emptype">Employment Type</label>
                      <input
                        id="emptype"
                        type="text"
                        className="form-control"
                        name="emptype"
                        value={profile.empType}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              empType: e.target.value,
                            },
                          })
                        }
                        required
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
                        value={profile.costCenter}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              costCenter: e.target.value,
                            },
                          })
                        }
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
                        value={profile.portfolios}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              portfolios: e.target.value,
                            },
                          })
                        }
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
                        value={profile.offering}
                        onChange={e =>
                          this.setState({
                            profile: {
                              ...this.state.profile,
                              offering: e.target.value,
                            },
                          })
                        }
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
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

CreateEmployee.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateEmployee;
