import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { NotificationManager } from 'react-notifications';
import { Roles } from 'meteor/alanning:roles';
import Select from 'react-select';

// collection
import Projects from '../../../api/projects/projects';

// import components

// import styles
import './ProjectUpdate.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class ProjectUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginRoles: {
        admin: false,
        projMan: false,
      },
      isChanged: false,
      reactSelect: {
        pmIdValue: null,
        statusValue: { value: 'Presales', label: 'Presales' },
        statusOptions: [
          {
            value: 'Presales',
            label: 'Presales',
          },
          {
            value: 'Kick-off',
            label: 'Kick-off',
          },
          {
            value: 'Blueprint',
            label: 'Blueprint',
          },
          {
            value: 'Realization',
            label: 'Realization',
          },
          {
            value: 'SIT',
            label: 'SIT',
          },
          {
            value: 'UAT',
            label: 'UAT',
          },
          {
            value: 'Go-live',
            label: 'Go-live',
          },
          {
            value: 'Go-live Support',
            label: 'Go-live Support',
          },
        ],
      },
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.customFilter = this.customFilter.bind(this);
  }

  componentWillMount() {
    if (!Meteor.userId()) {
      return this.props.history.push('/login');
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!Meteor.userId()) {
      nextProps.history.push('/login');
      return false;
    }
    return true;
  }

  customFilter(option, searchText) {
    if (
      option.data.profile.fullName
        .toLowerCase()
        .includes(searchText.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  handleSubmit(e) {
    e.preventDefault();
    const { project } = this.props;
    Meteor.call('project.update', project._id, project, (err, res) => {
      if (err) {
        NotificationManager.error(
          `Cannot update: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success('Project is updated', 'Success', 3000);
        return this.props.history.push('/project');
      }
    });
  }

  render() {
    const { loggedIn, projectsReady, project, usersReady, users } = this.props;
    const { loginRoles, reactSelect } = this.state;

    if (Meteor.userId()) {
      if (
        Roles.userIsInRole(Meteor.userId(), 'superadmin') ||
        Roles.userIsInRole(Meteor.userId(), 'admin')
      ) {
        loginRoles.admin = true;
      }
      if (Roles.userIsInRole(Meteor.userId(), 'projman')) {
        loginRoles.projMan = true;
      }
    }

    // Selects Component Options
    const pmIdSelectOptions = _.map(users, user => {
      return {
        value: user._id,
        label: user.profile.fullName,
        profile: user.profile,
      };
    });
    const defaultPMIdOption = project
      ? _.findWhere(pmIdSelectOptions, { value: project._pmId })
      : null;
    reactSelect.pmIdValue = defaultPMIdOption;
    const defaultStatusOption = project
      ? _.findWhere(reactSelect.statusOptions, { value: project.status })
      : null;
    reactSelect.statusValue = defaultStatusOption;

    const reactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        backgroundColor: state.isDisabled ? '#e9ecef' : '#fff',
        borderColor: state.isFocused ? '#80bdff' : '#ced4da',
        outline: state.isFocused ? 0 : null,
        boxShadow: state.isFocused
          ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
          : '',
      }),
    };

    if (!loggedIn) {
      return null;
    }

    return (
      <section className="create-employee-page">
        <div className="card mx-auto" style={{ maxWidth: '28rem' }}>
          <div className="card-header">
            <div className="card-body">
              <h1 className="card-title text-center">Update Project</h1>
              {!loginRoles.admin && !loginRoles.projMan && (
                <h4 className="text-center text-danger">
                  You are not authorized to view Project
                </h4>
              )}
              {projectsReady &&
                usersReady &&
                (loginRoles.admin || loginRoles.projMan) && (
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
                            onChange={e => {
                              this.setState({
                                isChanged: true,
                              });
                              project.projectName = e.target.value;
                            }}
                            required
                            disabled={!loginRoles.admin}
                          />
                        </div>

                        {/* <!-- Engagement Code --> */}
                        <div className="form-group">
                          <label htmlFor="engagementcode">
                            Engagement Code
                          </label>
                          <input
                            id="engagementcode"
                            type="text"
                            className="form-control"
                            name="engagementcode"
                            value={project.engagementCode}
                            onChange={e => {
                              this.setState({
                                isChanged: true,
                              });
                              project.engagementCode = e.target.value;
                            }}
                            required
                            disabled={!loginRoles.admin}
                          />
                        </div>

                        {/* <!-- Project Manager --> */}
                        <div className="form-group">
                          <label htmlFor="pmid">Project Manager</label>
                          <Select
                            value={reactSelect.pmIdValue}
                            options={pmIdSelectOptions}
                            placeholder="Select Project Manager"
                            onChange={selectedOption => {
                              this.setState({
                                isChanged: true,
                                reactSelect: {
                                  ...this.state.reactSelect,
                                  pmIdValue: selectedOption,
                                },
                              });
                              project._pmId = selectedOption
                                ? selectedOption.value
                                : '';
                            }}
                            filterOption={this.customFilter}
                            isClearable="true"
                            isDisabled={!loginRoles.admin}
                            styles={reactSelectStyle}
                            valueKey="value"
                            labelKey="label"
                          />
                        </div>

                        {/* <!-- Start Date --> */}
                        <div className="form-group">
                          <label htmlFor="startdate">Start Date</label>
                          <DatePicker
                            className="form-control"
                            selected={project.startDate}
                            onChange={date => {
                              this.setState({
                                isChanged: true,
                              });
                              project.startDate = date;
                            }}
                            maxDate={project.endDate}
                            dateFormat="MMM dd, yyyy"
                            disabled={!loginRoles.admin}
                          />
                        </div>

                        {/* <!-- End Date --> */}
                        <div className="form-group">
                          <label htmlFor="enddate">End Date</label>
                          <DatePicker
                            className="form-control"
                            selected={project.endDate}
                            onChange={date => {
                              this.setState({
                                isChanged: true,
                              });
                              project.endDate = date;
                            }}
                            minDate={project.startDate}
                            dateFormat="MMM dd, yyyy"
                            disabled={!loginRoles.admin}
                          />
                        </div>

                        {/* <!-- Status --> */}
                        <div className="form-group">
                          <label htmlFor="status">Status</label>
                          <Select
                            defaultValue={defaultStatusOption}
                            value={reactSelect.statusValue}
                            options={reactSelect.statusOptions}
                            placeholder="Select Status"
                            onChange={selectedOption => {
                              this.setState({
                                isChanged: true,
                                reactSelect: {
                                  ...this.state.reactSelect,
                                  statusValue: selectedOption,
                                },
                              });
                              project.status = selectedOption.value;
                            }}
                            styles={reactSelectStyle}
                            isSearchable={false}
                            isDisabled={!loginRoles.admin}
                          />
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
                            onChange={e => {
                              this.setState({
                                isChanged: true,
                              });
                              project.remark = e.target.value;
                            }}
                            disabled={!loginRoles.admin}
                          />
                        </div>

                        {/* <!-- Active --> */}
                        <div className="form-group">
                          <button
                            type="button"
                            className={
                              project.disabled
                                ? 'btn btn-block btn-secondary'
                                : 'btn btn-block btn-primary'
                            }
                            onClick={() => {
                              this.setState({
                                isChanged: true,
                              });
                              project.disabled = !project.disabled;
                            }}
                            disabled={!loginRoles.admin}
                          >
                            {project.disabled ? 'Inactive' : 'Active'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {loginRoles.admin && (
                      <div className="form-group no-margin">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block mb-2"
                          disabled={!this.state.isChanged}
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </form>
                )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

ProjectUpdate.defaultProps = {
  // users: null, remote example (if using ddp)\
  project: null,
  users: null,
};

ProjectUpdate.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  projectsReady: PropTypes.bool.isRequired,
  project: PropTypes.object,
  usersReady: PropTypes.bool.isRequired,
  users: Meteor.user() ? PropTypes.array.isRequired : () => null,
};

export default withTracker(props => {
  const projectSub = Meteor.subscribe('projects.all'); // publication needs to be set on remote server
  const projects = Projects.find().fetch();
  const project = _.findWhere(projects, { _id: props.match.params._id });
  const projectsReady = projectSub.ready() && !!projects;

  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const usersReady = usersSub.ready() && !!users;

  return {
    projectsReady,
    project,
    usersReady,
    users,
  };
})(ProjectUpdate);
