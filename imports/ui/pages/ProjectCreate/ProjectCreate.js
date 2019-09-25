import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { NotificationManager } from 'react-notifications';

// import components

// import styles
import './ProjectCreate.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class ProjectCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: {
        projectName: '',
        engagementCode: '',
        _pmId: '',
        startDate: new Date(),
        endDate: new Date(),
        status: 'Presales',
        remark: '',
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
    const { project } = this.state;
    Meteor.call('project.create', project, (err, res) => {
      if (err) {
        NotificationManager.error(
          `Cannot create: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success('New project is created', 'Success', 3000);
        return this.props.history.push('/project');
      }
    });
  }

  render() {
    const { loggedIn, usersReady, users } = this.props;
    const { project } = this.state;

    if (!loggedIn) {
      return null;
    }

    return (
      <section className="create-employee-page">
        <div className="card mx-auto" style={{ maxWidth: '28rem' }}>
          <div className="card-header">
            <div className="card-body">
              <h1 className="card-title text-center">Create Project</h1>
              <form onSubmit={this.handleSubmit}>
                {/* <!-- First Col --> */}
                <div className="row">
                  <div className="col-md-12">
                    {/* <!-- Project Name --> */}
                    <div className="form-group">
                      <label htmlFor="projectname">Project Name</label>
                      <input
                        id="projectname"
                        type="text"
                        className="form-control"
                        name="projectname"
                        value={project.projectName}
                        onChange={e =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              projectName: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>

                    {/* <!-- Engagement Code --> */}
                    <div className="form-group">
                      <label htmlFor="engagementcode">Engagement Code</label>
                      <input
                        id="engagementcode"
                        type="text"
                        className="form-control"
                        name="engagementcode"
                        value={project.engagementCode}
                        onChange={e =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              engagementCode: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>

                    {/* <!-- Project Manager --> */}
                    <div className="form-group">
                      <label htmlFor="pmid">Project Manager</label>
                      <select
                        id="pmid"
                        type="text"
                        className="form-control"
                        name="pmid"
                        defaultValue={project._pmId}
                        onChange={e =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              _pmId: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="" key="0" disabled>
                          Select Project Manager
                        </option>
                        {_.map(users, user => {
                          return (
                            <option value={user._id} key={user._id}>
                              {user.profile.fullName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* <!-- Start Date --> */}
                    <div className="form-group">
                      <label htmlFor="startdate">Start Date</label>
                      <DatePicker
                        className="form-control"
                        selected={project.startDate}
                        onChange={date =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              startDate: date,
                            },
                          })
                        }
                        maxDate={project.endDate}
                        dateFormat="MMM dd, yyyy"
                      />
                    </div>

                    {/* <!-- End Date --> */}
                    <div className="form-group">
                      <label htmlFor="enddate">End Date</label>
                      <DatePicker
                        className="form-control"
                        selected={project.endDate}
                        onChange={date =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              endDate: date,
                            },
                          })
                        }
                        minDate={project.startDate}
                        dateFormat="MMM dd, yyyy"
                      />
                    </div>

                    {/* <!-- Status --> */}
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        type="text"
                        className="form-control"
                        name="status"
                        defaultValue={project.status}
                        onChange={e =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              status: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="Presales">Presales</option>
                        <option value="Kick-off">Kick-off</option>
                        <option value="Blueprint">Blueprint</option>
                        <option value="Realization">Realization</option>
                        <option value="SIT">SIT</option>
                        <option value="UAT">UAT</option>
                        <option value="Go-live">Go-live</option>
                        <option value="Go-live Support">Go-live Support</option>
                      </select>
                    </div>

                    {/* <!-- Remark --> */}
                    <div className="form-group">
                      <label htmlFor="remark">Remark</label>
                      <input
                        id="remark"
                        type="text"
                        className="form-control"
                        name="remark"
                        value={project.remark || ''}
                        onChange={e =>
                          this.setState({
                            project: {
                              ...this.state.project,
                              remark: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group no-margin">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-2"
                  >
                    Create
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

ProjectCreate.defaultProps = {
  // users: null, remote example (if using ddp)
  users: null,
};

ProjectCreate.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  usersReady: PropTypes.bool.isRequired,
  users: Meteor.user() ? PropTypes.array.isRequired : () => null,
};

export default withTracker(() => {
  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const usersReady = usersSub.ready() && !!users;

  return {
    usersReady,
    users,
  };
})(ProjectCreate);