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

// collection
import Projects from '../../../api/projects/projects';
import Assignments from '../../../api/assignments/assignments';

// components
import ProjectCard from '../../components/ProjectCard';
import EmployeeCard from '../../components/EmployeeCard';

import './EmployeeAssignment.scss';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-notifications/lib/notifications.css';
import Navbar from '../../components/Navbar/Navbar';

// functions
function getDateRange(startDate, stopDate) {
  const dateRange = new Array();

  const startDateObj = moment(startDate);
  const stopDateObj = moment(stopDate);

  let currentDate = startDateObj;

  while (currentDate.isSameOrBefore(stopDateObj, 'day')) {
    dateRange.push(new Date(currentDate));
    currentDate = moment(currentDate).add(1, 'd');
  }
  return dateRange;
}

function findEmployeeProjectFromAssignments(projects, employeeAssignments) {
  let returnProject = null;

  const currentAssignment = _.find(employeeAssignments, assignment => {
    const startDate = moment(assignment.startDate);
    const endDate = moment(assignment.endDate);
    const currentDate = moment(new Date());
    return (
      startDate.isSameOrBefore(currentDate, 'day') &&
      endDate.isSameOrAfter(currentDate, 'day')
    );
  });

  if (currentAssignment) {
    returnProject = _.findWhere(projects, {
      _id: currentAssignment._projectId,
    });
  }

  return returnProject;
}

class EmployeeAssignment extends React.Component {
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
        heightRow: 226,
        calendarData: {},
        calendarHeight: 170,
        calendarHeightRow: 186,
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
      projects,
      project,
      usersReady,
      user,
      assignmentsReady,
      employeeAssignments,
    } = this.props;
    const { newAssignment, isDefaultSet, chartData } = this.state;

    if (user && !isDefaultSet.set) {
      isDefaultSet.set = true;
      newAssignment._employeeId = user._id;
    }

    // Chart Date
    const chartCalendarDataDeclare = [
      { type: 'date', id: 'Date' },
      { type: 'number', id: 'Percent' },
    ];
    let chartCalendarDataItems = [];

    if (employeeAssignments) {
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
      const chartDataItems = _.map(employeeAssignments, assignment => {
        const assignedProject = _.findWhere(projects, {
          _id: assignment._projectId,
        });
        return [
          assignment._id,
          assignedProject.projectName,
          assignedProject.projectName,
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

      const assignmentChartHeight = (_.size(employeeAssignments) + 1) * 40;
      if (chartData.height < assignmentChartHeight) {
        chartData.height = assignmentChartHeight;
        chartData.heightRow = assignmentChartHeight + 16;
      }

      chartCalendarDataItems = _.map(
        _.values(
          _.groupBy(
            _.flatten(
              _.map(employeeAssignments, assignment => {
                const dateRange = getDateRange(
                  assignment.startDate,
                  assignment.endDate
                );
                return _.map(dateRange, date => {
                  return [
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    ),
                    assignment.percent,
                  ];
                });
              }),
              true
            ),
            item => {
              return item[0];
            }
          )
        ),
        day => {
          return [
            day[0][0],
            _.reduce(
              _.map(day, item => {
                return item[1];
              }),
              (memo, item) => {
                return memo + item;
              },
              0
            ),
          ];
        }
      );
    }

    let chartCalendarDataCombine = [];
    chartCalendarDataCombine.push(chartCalendarDataDeclare);
    if (_.size(chartCalendarDataItems) > 0) {
      chartCalendarDataCombine = _.union(
        chartCalendarDataCombine,
        chartCalendarDataItems
      );
    }

    let assignmentCalendarChartHeight = 170;
    if (_.size(chartCalendarDataItems) > 1) {
      assignmentCalendarChartHeight =
        _.size(
          _.uniq(
            _.map(chartCalendarDataItems, item => {
              return item[0].getFullYear();
            })
          )
        ) *
          150 +
        20;
    }
    chartData.calendarHeight = assignmentCalendarChartHeight;
    chartData.calendarHeightRow = assignmentCalendarChartHeight + 16;

    chartData.calendarData = chartCalendarDataCombine;

    if (!loggedIn) {
      return null;
    }
    return (
      <div className="employee-assignment-page">
        <h1 className="mb-4">
          {user ? `Assign ${user.profile.fullName}` : `Assign`}
        </h1>
        <div className="container">
          <div className="row">
            {projectsReady && usersReady && assignmentsReady && (
              <>
                <EmployeeCard user={user} key={user._id} />
                {project && <ProjectCard project={project} key={project._id} />}

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
                                      <select
                                        id="employeeid"
                                        type="text"
                                        className="form-control"
                                        name="employeeid"
                                        defaultValue={newAssignment._employeeId}
                                        disabled
                                        required
                                      >
                                        <option value={user._id} key={user._id}>
                                          {user.profile.fullName}
                                        </option>
                                      </select>
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
                                        onChange={e =>
                                          this.setState({
                                            newAssignment: {
                                              ...this.state.newAssignment,
                                              _projectId: e.target.value,
                                            },
                                          })
                                        }
                                        required
                                      >
                                        <option value="" key="0" disabled>
                                          Select Project
                                        </option>
                                        {_.map(projects, project => {
                                          return (
                                            <option
                                              value={project._id}
                                              key={project._id}
                                            >
                                              {project.projectName}
                                            </option>
                                          );
                                        })}
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

                {/* <!-- Remark --> */}
                <div className="col-xs-12 col-sm-12 col-md-12 employee-assignment-card">
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
                              Employee Assignments
                            </h1>
                            <div
                              className="collapse"
                              id="collapseProjAssignments"
                            >
                              {_.map(employeeAssignments, assignment => {
                                const assignedProject = _.findWhere(projects, {
                                  _id: assignment._projectId,
                                });
                                return (
                                  <div className="row" key={assignment._id}>
                                    <div className="col-md-2 pb-2 pt-2 assign-name-text">
                                      <NavLink
                                        to={`/project/assignment/${
                                          assignedProject._id
                                        }`}
                                      >
                                        {assignedProject.projectName}
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
                            <div
                              className="row"
                              key="0"
                              style={{ height: chartData.calendarHeightRow }}
                            >
                              <div className="col-md-12 pb-2 pt-2">
                                <Chart
                                  width="auto"
                                  height={`${chartData.calendarHeight}px`}
                                  chartType="Calendar"
                                  loader={<div>Chart loading...</div>}
                                  data={chartData.calendarData}
                                  options={{
                                    title: 'Employee Calendar',
                                    calendar: {
                                      yearLabel: {
                                        fontName: 'Roboto',
                                      },
                                      dayOfWeekLabel: {
                                        fontName: 'Roboto',
                                      },
                                      monthLabel: {
                                        fontName: 'Roboto',
                                      },
                                    },
                                    colorAxis: { minValue: 0 },
                                  }}
                                  rootProps={{ 'data-testid': '1' }}
                                />
                              </div>
                            </div>
                            <div
                              className="row"
                              key="1"
                              style={{ height: chartData.heightRow }}
                            >
                              <div className="col-md-12 pb-2 pt-2">
                                {_.size(employeeAssignments) > 0 && (
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
                                    rootProps={{ 'data-testid': '2' }}
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

EmployeeAssignment.defaultProps = {
  // users: null, remote example (if using ddp)
  projects: null,
  project: null,
  user: null,
  employeeAssignments: null,
};

EmployeeAssignment.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  projectsReady: PropTypes.bool.isRequired,
  projects: Projects ? PropTypes.array.isRequired : () => null,
  project: PropTypes.object,
  usersReady: PropTypes.bool.isRequired,
  user: PropTypes.object,
  assignmentsReady: PropTypes.bool.isRequired,
  employeeAssignments: Assignments ? PropTypes.array : () => null,
};

export default withTracker(props => {
  const projectsSub = Meteor.subscribe('projects.all'); // publication needs to be set on remote server
  const projects = Projects.find().fetch();
  const projectsReady = projectsSub.ready() && !!projects;

  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const user = _.findWhere(users, { _id: props.match.params._id });
  const usersReady = usersSub.ready() && !!users;

  const assignmentsSub = Meteor.subscribe('assignments.all'); // publication needs to be set on remote server
  const assignments = Assignments.find().fetch();
  const employeeAssignments = user
    ? _.sortBy(_.where(assignments, { _employeeId: user._id }), assignment => {
        return assignment.startDate;
      })
    : null;
  const project =
    projectsReady && employeeAssignments
      ? findEmployeeProjectFromAssignments(projects, employeeAssignments)
      : null;
  const assignmentsReady = assignmentsSub.ready() && !!employeeAssignments;

  return {
    projectsReady,
    projects,
    project,
    usersReady,
    user,
    assignmentsReady,
    employeeAssignments,
  };
})(EmployeeAssignment);
