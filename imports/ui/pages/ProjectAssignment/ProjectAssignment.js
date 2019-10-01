import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import TagsInput from 'react-tagsinput';
import moment from 'moment/moment';
import { Chart } from 'react-google-charts';
import { NotificationManager } from 'react-notifications';
import { NavLink } from 'react-router-dom';
import Select from 'react-select';

// collection
import Projects from '../../../api/projects/projects';
import Assignments from '../../../api/assignments/assignments';

// components
import ProjectCard from '../../components/ProjectCard';
import EmployeeCard from '../../components/EmployeeCard';

import './ProjectAssignment.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';

class ProjectAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newAssignment: {
        _employeeId: '',
        _projectId: '',
        startDate: new Date(),
        endDate: new Date(),
        availableDate: new Date(),
        percent: 100,
        level: 'Member',
        role: 'Member',
        talents: [],
        remark: '',
      },
      isDefaultSet: {
        set: false,
      },
      chartData: {
        data: {},
        height: 210,
      },
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteAssignment = this.handleDeleteAssignment.bind(this);
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
    const { newAssignment } = this.state;
    Meteor.call('assignment.create', newAssignment, (err, res) => {
      if (err) {
        NotificationManager.error(`Cannot add: ${err.message}`, 'Error', 3000);
      } else {
        NotificationManager.success('New assignment is added', 'Success', 3000);
      }
    });
  }

  handleDeleteAssignment(_id) {
    Meteor.call('assignment.delete', _id, (err, res) => {
      if (err) {
        NotificationManager.error(
          `Cannot delete: ${err.message}`,
          'Error',
          3000
        );
      } else {
        NotificationManager.success('Assignment is deleted', 'Success', 3000);
      }
    });
  }

  render() {
    const {
      loggedIn,
      projectsReady,
      project,
      usersReady,
      users,
      user,
      assignmentsReady,
      projectAssignments,
    } = this.props;
    const { newAssignment, isDefaultSet, chartData } = this.state;

    if (project && !isDefaultSet.set) {
      isDefaultSet.set = true;
      newAssignment._projectId = project._id;
      newAssignment.startDate = project.startDate;
      newAssignment.endDate = project.endDate;
    }

    if (projectAssignments) {
      const chartDataDeclare = [
        { type: 'string', label: 'Task ID' },
        { type: 'string', label: 'Task Name' },
        { type: 'string', label: 'Resource' },
        { type: 'date', label: 'Start Date' },
        { type: 'date', label: 'End Date' },
        { type: 'number', label: 'Duration' },
        {
          type: 'number',
          label: 'Percent Complete',
        },
        {
          type: 'string',
          label: 'Dependencies',
        },
      ];
      const chartDataItems = _.map(projectAssignments, assignment => {
        const assignedUser = _.findWhere(users, {
          _id: assignment._employeeId,
        });
        return [
          assignment._id,
          assignedUser.profile.fullName,
          assignedUser.profile.fullName,
          assignment.startDate,
          assignment.endDate,
          null,
          assignment.percent,
          null,
        ];
      });
      let chartDataCombine = [];
      chartDataCombine.push(chartDataDeclare);
      chartDataCombine = _.union(chartDataCombine, chartDataItems);
      chartData.data = chartDataCombine;

      const assignmentChartHeight = (_.size(projectAssignments) + 1) * 40;
      chartData.height < assignmentChartHeight
        ? (chartData.height = assignmentChartHeight)
        : () => null;
    }

    const userSelectOptions = _.map(users, user => {
      return { value: user._id, label: user.profile.fullName };
    });

    const reactSelectStyle = {
      control: (provided, state) => ({
        ...provided,
        backgroundColor: '#fff',
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
      <div className="project-assignment-page">
        <h1 className="mb-4">
          {projectsReady ? `Project ${project.projectName}` : `Project`}
        </h1>
        <div className="container">
          <div className="row">
            {projectsReady && usersReady && assignmentsReady && (
              <>
                <ProjectCard project={project} key={project._id} />
                <EmployeeCard user={user} key={user._id} />

                <div className="col-xs-12 col-sm-12 col-md-12 new-assignment-card">
                  <div className="image-flip">
                    <div className="mainflip">
                      <div className="frontside">
                        <div className="card">
                          <div className="card-body">
                            <h1
                              className="card-title text-center dropdown-toggle"
                              data-toggle="collapse"
                              href="#collapseNewAssign"
                              aria-expanded="false"
                              aria-controls="collapseNewAssign"
                            >
                              New Assignment
                            </h1>
                            <div className="collapse" id="collapseNewAssign">
                              <form onSubmit={this.handleSubmit}>
                                <div className="row">
                                  {/* <!-- First Col --> */}
                                  <div className="col-md-4">
                                    {/* <!-- Employee --> */}
                                    <div className="form-group">
                                      <label htmlFor="employeeid">
                                        Employee
                                      </label>
                                      <Select
                                        defaultValue={newAssignment._employeeId}
                                        options={userSelectOptions}
                                        placeholder="Select Employee"
                                        onChange={selectedOption => {
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              _employeeId: selectedOption.value,
                                            },
                                          });
                                        }}
                                        styles={reactSelectStyle}
                                      />
                                    </div>

                                    {/* <!-- Project --> */}
                                    <div className="form-group">
                                      <label htmlFor="projectid">Project</label>
                                      <select
                                        id="projectid"
                                        type="text"
                                        className="form-control"
                                        name="projectid"
                                        defaultValue={newAssignment._projectId}
                                        disabled
                                        required
                                      >
                                        <option
                                          value={project._id}
                                          key={project._id}
                                        >
                                          {project.projectName}
                                        </option>
                                      </select>
                                    </div>

                                    {/* <!-- Percentage --> */}
                                    <div className="form-group">
                                      <label htmlFor="percent">
                                        Percentage
                                      </label>
                                      <select
                                        id="percent"
                                        type="text"
                                        className="form-control"
                                        name="percent"
                                        defaultValue={newAssignment.percent}
                                        onChange={e => {
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              percent: parseInt(e.target.value),
                                            },
                                          });
                                        }}
                                        required
                                      >
                                        <option value="20">20</option>
                                        <option value="40">40</option>
                                        <option value="60">60</option>
                                        <option value="80">80</option>
                                        <option value="100">100</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* <!-- Second Col --> */}
                                  <div className="col-md-4">
                                    {/* <!-- Start Date --> */}
                                    <div className="form-group">
                                      <label htmlFor="startdate">
                                        Start Date
                                      </label>
                                      <DatePicker
                                        className="form-control"
                                        selected={newAssignment.startDate}
                                        onChange={date =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              startDate: date,
                                              availableDate: date,
                                            },
                                          })
                                        }
                                        maxDate={newAssignment.endDate}
                                        dateFormat="MMM dd, yyyy"
                                      />
                                    </div>

                                    {/* <!-- End Date --> */}
                                    <div className="form-group">
                                      <label htmlFor="enddate">End Date</label>
                                      <DatePicker
                                        className="form-control"
                                        selected={newAssignment.endDate}
                                        onChange={date =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              endDate: date,
                                            },
                                          })
                                        }
                                        minDate={newAssignment.startDate}
                                        dateFormat="MMM dd, yyyy"
                                      />
                                    </div>

                                    {/* <!-- Talents --> */}
                                    <div className="form-group">
                                      <label htmlFor="talents">
                                        Capabilities
                                      </label>
                                      <TagsInput
                                        id="talents"
                                        className="form-control"
                                        value={newAssignment.talents}
                                        maxTags={3}
                                        onChange={tags =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              talents: tags,
                                            },
                                          })
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* <!-- Third Col --> */}
                                  <div className="col-md-4">
                                    {/* <!-- Level --> */}
                                    <div className="form-group">
                                      <label htmlFor="level">Level</label>
                                      <select
                                        id="level"
                                        type="text"
                                        className="form-control"
                                        name="level"
                                        defaultValue={newAssignment.level}
                                        onChange={e =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              level: e.target.value,
                                            },
                                          })
                                        }
                                        required
                                      >
                                        <option value="Project Manager">
                                          Project Manager
                                        </option>
                                        <option value="Team Lead">
                                          Team Lead
                                        </option>
                                        <option value="Member">Member</option>
                                      </select>
                                    </div>

                                    {/* <!-- Role --> */}
                                    <div className="form-group">
                                      <label htmlFor="role">Task Role</label>
                                      <select
                                        id="role"
                                        type="text"
                                        className="form-control"
                                        name="role"
                                        defaultValue={newAssignment.role}
                                        onChange={e =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              role: e.target.value,
                                            },
                                          })
                                        }
                                        required
                                      >
                                        <option value="Authorization Lead">
                                          Authorization Lead
                                        </option>
                                        <option value="Data Lead">
                                          Data Lead
                                        </option>
                                        <option value="Training Lead">
                                          Training Lead
                                        </option>
                                        <option value="Interface Lead">
                                          Interface Lead
                                        </option>
                                        <option value="Integration Lead">
                                          Integration Lead
                                        </option>
                                        <option value="Technical Lead">
                                          Technical Lead
                                        </option>
                                        <option value="UT Lead">UT Lead</option>
                                        <option value="SIT Lead">
                                          SIT Lead
                                        </option>
                                        <option value="UAT Lead">
                                          UAT Lead
                                        </option>
                                        <option value="Cut-over Lead">
                                          Cut-over Lead
                                        </option>
                                        <option value="Member">Member</option>
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
                                        value={newAssignment.remark || ''}
                                        onChange={e =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
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
                                    Add
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xs-12 col-sm-12 col-md-12 project-assignment-card">
                  <div className="image-flip">
                    <div className="mainflip">
                      <div className="frontside">
                        <div className="card">
                          <div className="card-body">
                            <h1
                              className="card-title text-center dropdown-toggle"
                              data-toggle="collapse"
                              href="#collapseProjAssignments"
                              aria-expanded="false"
                              aria-controls="collapseProjAssignments"
                            >
                              Project Assignments
                            </h1>
                            <div
                              className="collapse"
                              id="collapseProjAssignments"
                            >
                              {_.map(projectAssignments, assignment => {
                                const assignedUser = _.findWhere(users, {
                                  _id: assignment._employeeId,
                                });
                                return (
                                  <div className="row" key={assignment._id}>
                                    <div className="col-md-2 pb-2 pt-2 assign-name-text">
                                      <NavLink
                                        to={`/employee/assignment/${
                                          assignedUser._id
                                        }`}
                                      >
                                        {assignedUser.profile.fullName}
                                        &nbsp;
                                        <span className="badge badge-pill badge-warning">
                                          {assignedUser.profile.posTitle}
                                        </span>
                                      </NavLink>
                                    </div>
                                    <div className="col-md-3 pb-2 pt-2">
                                      {`${moment(assignment.startDate).format(
                                        'MMM DD, YYYY'
                                      )} - ${moment(assignment.endDate).format(
                                        'MMM DD, YYYY'
                                      )}`}
                                    </div>
                                    <div className="col-md-1 pb-2 pt-2">
                                      {`${assignment.percent}%`}
                                    </div>
                                    <div className="col-md-3 pb-2 pt-2">
                                      {assignment.level === 'Member' &&
                                      assignment.role === 'Member'
                                        ? `${assignment.level}`
                                        : assignment.level !== 'Member' &&
                                          assignment.role !== 'Member'
                                        ? `${assignment.level} & ${
                                            assignment.role
                                          }`
                                        : assignment.level !== 'Member'
                                        ? `${assignment.level}`
                                        : assignment.role !== 'Member'
                                        ? `${assignment.role}`
                                        : ''}
                                    </div>
                                    <div className="col-md-2 pb-2 pt-2">
                                      {assignment.talents
                                        ? _.map(assignment.talents, talent => {
                                            return (
                                              <span
                                                className="react-tagsinput-tag"
                                                key={talent}
                                              >
                                                {talent}
                                              </span>
                                            );
                                          })
                                        : ''}
                                    </div>
                                    <div className="col-md-1 pb-2 pt-2">
                                      <button
                                        type="button"
                                        className="close"
                                        aria-label="Close"
                                        onClick={() =>
                                          this.handleDeleteAssignment(
                                            assignment._id
                                          )
                                        }
                                      >
                                        <span aria-hidden="true">&times;</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="row" key="0">
                              <div className="col-md-12 pb-2 pt-2">
                                {_.size(projectAssignments) > 0 && (
                                  <Chart
                                    width="100%"
                                    height={`${chartData.height}px`}
                                    chartType="Gantt"
                                    loader={<div>Chart loading...</div>}
                                    data={chartData.data}
                                    options={{
                                      height: chartData.height,
                                      gantt: {
                                        trackHeight: 40,
                                        labelStyle: {
                                          fontName: 'Nunito-Bold',
                                        },
                                      },
                                    }}
                                    rootProps={{ 'data-testid': '1' }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ProjectAssignment.defaultProps = {
  // users: null, remote example (if using ddp)
  project: null,
  users: null,
  user: null,
  projectAssignments: null,
};

ProjectAssignment.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  projectsReady: PropTypes.bool.isRequired,
  project: PropTypes.object,
  usersReady: PropTypes.bool.isRequired,
  users: Meteor.user() ? PropTypes.array.isRequired : () => null,
  user: PropTypes.object,
  assignmentsReady: PropTypes.bool.isRequired,
  projectAssignments: Assignments ? PropTypes.array : () => null,
};

export default withTracker(props => {
  const projectsSub = Meteor.subscribe('projects.all'); // publication needs to be set on remote server
  const projects = Projects.find().fetch();
  const project = _.findWhere(projects, { _id: props.match.params._id });
  const projectsReady = projectsSub.ready() && !!projects;

  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const user = project ? _.findWhere(users, { _id: project._pmId }) : null;
  const usersReady = usersSub.ready() && !!users;

  const assignmentsSub = Meteor.subscribe('assignments.all'); // publication needs to be set on remote server
  const assignments = Assignments.find().fetch();
  const projectAssignments = project
    ? _.sortBy(
        _.sortBy(
          _.where(assignments, { _projectId: project._id }),
          assignment => {
            return assignment.startDate;
          }
        ),
        assignment => {
          return assignment._employeeId;
        }
      )
    : null;
  const assignmentsReady = assignmentsSub.ready() && !!projectAssignments;

  return {
    projectsReady,
    project,
    usersReady,
    users,
    user,
    assignmentsReady,
    projectAssignments,
  };
})(ProjectAssignment);
