import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import moment from 'moment/moment';
import numeral from 'numeral';
import { Chart } from 'react-google-charts';

// collection
import Projects from '../../../api/projects/projects';
import Assignments from '../../../api/assignments/assignments';

// components

import './Report.scss';
import 'react-datepicker/dist/react-datepicker.css';

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

function getInRangeAssignments(startDate, stopDate, assignments) {
  const startDateObj = moment(startDate);
  const stopDateObj = moment(stopDate);

  return _.filter(assignments, assignment => {
    const assignStartDateObj = moment(assignment.startDate);
    const assignStopDateObj = moment(assignment.endDate);

    return (
      assignStartDateObj.isSameOrBefore(stopDateObj, 'day') &&
      assignStopDateObj.isSameOrAfter(startDateObj, 'day')
    );
  });
}

function getChartBenchByDateDataItems(dateRange, assignments, users) {
  return _.map(dateRange, date => {
    const currentDateObj = moment(date);

    const assignmentsOnDateCount = _.filter(assignments, assignment => {
      const assignStartDateObj = moment(assignment.startDate);
      const assignStopDateObj = moment(assignment.endDate);

      return (
        assignStartDateObj.isSameOrBefore(currentDateObj, 'day') &&
        assignStopDateObj.isSameOrAfter(currentDateObj, 'day')
      );
    });

    const unassignedUserOnDate = _.reject(users, user => {
      return _.contains(
        _.unique(_.pluck(assignmentsOnDateCount, '_employeeId')),
        user._id
      );
    });

    return [
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      _.size(
        _.filter(unassignedUserOnDate, user => {
          return user.profile.base === 'HCM';
        })
      ),
      _.size(
        _.filter(unassignedUserOnDate, user => {
          return user.profile.base === 'HN';
        })
      ),
    ];
  });
}

function getChartBenchByModuleDataItems(unassignedUsers) {
  const moduleList = _.uniq(
    _.flatten(
      _.map(unassignedUsers, user => {
        return user.profile.talents;
      })
    )
  );

  return _.map(moduleList, module => {
    return [
      module,
      _.size(
        _.filter(unassignedUsers, user => {
          return (
            _.contains(user.profile.talents, module) &&
            user.profile.base === 'HCM'
          );
        })
      ),
      _.size(
        _.filter(unassignedUsers, user => {
          return (
            _.contains(user.profile.talents, module) &&
            user.profile.base === 'HN'
          );
        })
      ),
    ];
  });
}

function getChartBenchByLevelDataItems(unassignedUsers) {
  const levelList = _.sortBy(
    _.map(
      _.uniq(
        _.map(unassignedUsers, user => {
          return user.profile.posTitle;
        })
      ),
      level => {
        return [
          level === 'BA'
            ? 0
            : level === 'C'
            ? 1
            : level === 'SC'
            ? 2
            : level === 'M'
            ? 3
            : level === 'SM'
            ? 4
            : 5,
          level,
        ];
      }
    ),
    level => {
      return level[0];
    }
  );

  return _.map(levelList, level => {
    return [
      level[1],
      _.size(
        _.filter(unassignedUsers, user => {
          return (
            user.profile.posTitle === level[1] && user.profile.base === 'HCM'
          );
        })
      ),
      _.size(
        _.filter(unassignedUsers, user => {
          return (
            user.profile.posTitle === level[1] && user.profile.base === 'HN'
          );
        })
      ),
    ];
  });
}

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      endDate: new Date(moment().add(1, 'M')),
      chartData: {
        benchByDateData: {},
        benchByModuleData: {},
        benchByLevelData: {},
      },
    };
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

  render() {
    const {
      loggedIn,
      projectsReady,
      projects,
      usersReady,
      users,
      assignmentsReady,
      assignments,
    } = this.props;
    const { startDate, endDate, chartData } = this.state;

    if (!loggedIn) {
      return null;
    }

    // Summary
    const inRangeAssignments = getInRangeAssignments(
      startDate,
      endDate,
      assignments
    );
    const unassignedUsers = _.reject(users, user => {
      return _.contains(
        _.unique(_.pluck(inRangeAssignments, '_employeeId')),
        user._id
      );
    });
    const unassignedProjects = _.reject(projects, project => {
      return _.contains(
        _.unique(_.pluck(inRangeAssignments, '_projectId')),
        project._id
      );
    });

    const userCount = _.size(users);
    const projectCount = _.size(projects);
    const assignmentCount = _.size(inRangeAssignments);
    const assignedUsertCount = _.size(
      _.unique(_.pluck(inRangeAssignments, '_employeeId'))
    );
    const unassignedUsertCount = _.size(unassignedUsers);
    const unassignedProjectCount = _.size(unassignedProjects);
    const assignedUsertCountPercent = numeral(
      (assignedUsertCount / userCount) * 100
    ).format('0.0');
    const unassignedUsertCountPercent = numeral(
      (unassignedUsertCount / userCount) * 100
    ).format('0.0');

    // On bench by date data
    const dateRange = getDateRange(startDate, endDate); // Common used

    const chartBenchByDateDataDeclare = ['x', 'Ho Chi Minh', 'Ha Noi'];
    const chartBenchByDateDataItems = getChartBenchByDateDataItems(
      dateRange,
      inRangeAssignments,
      users
    );
    let chartBenchByDateDataCombine = [];
    chartBenchByDateDataCombine.push(chartBenchByDateDataDeclare);
    chartBenchByDateDataCombine = _.union(
      chartBenchByDateDataCombine,
      chartBenchByDateDataItems
    );
    chartData.benchByDateData = chartBenchByDateDataCombine;

    // On bench by module data
    const chartBenchByModuleDataDeclare = ['x', 'Ho Chi Minh', 'Ha Noi'];
    const chartBenchByModuleDataItems = getChartBenchByModuleDataItems(
      unassignedUsers
    );
    let chartBenchByModuleDataCombine = [];
    chartBenchByModuleDataCombine.push(chartBenchByModuleDataDeclare);
    chartBenchByModuleDataCombine = _.union(
      chartBenchByModuleDataCombine,
      chartBenchByModuleDataItems
    );
    chartData.benchByModuleData = chartBenchByModuleDataCombine;

    // On bench by level data
    const chartBenchByLevelDataDeclare = ['x', 'Ho Chi Minh', 'Ha Noi'];
    const chartBenchByLevelDataItems = getChartBenchByLevelDataItems(
      unassignedUsers
    );
    let chartBenchByLevelDataCombine = [];
    chartBenchByLevelDataCombine.push(chartBenchByLevelDataDeclare);
    chartBenchByLevelDataCombine = _.union(
      chartBenchByLevelDataCombine,
      chartBenchByLevelDataItems
    );
    chartData.benchByLevelData = chartBenchByLevelDataCombine;

    return (
      <div className="report-page">
        <h1 className="mb-4">Report</h1>
        {projectsReady && usersReady && assignmentsReady && (
          <div className="container">
            <div className="row">
              {/* <!-- Filter Card --> */}
              <div className="col-xs-12 col-sm-12 col-md-12 report-filter-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body">
                          <form>
                            <div className="row">
                              {/* <!-- First Col --> */}
                              <div className="col-md-6">
                                {/* <!-- Start Date --> */}
                                <div className="form-group">
                                  <label htmlFor="startdate">Start Date</label>
                                  <DatePicker
                                    className="form-control"
                                    selected={startDate}
                                    onChange={date =>
                                      this.setState({
                                        startDate: date,
                                      })
                                    }
                                    maxDate={endDate}
                                    dateFormat="MMM dd, yyyy"
                                  />
                                </div>
                              </div>

                              {/* <!-- First Col --> */}
                              <div className="col-md-6">
                                {/* <!-- End Date --> */}
                                <div className="form-group">
                                  <label htmlFor="enddate">End Date</label>
                                  <DatePicker
                                    className="form-control"
                                    selected={endDate}
                                    onChange={date =>
                                      this.setState({
                                        endDate: date,
                                      })
                                    }
                                    minDate={startDate}
                                    dateFormat="MMM dd, yyyy"
                                  />
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <!-- Summary Cards - Employees --> */}
              <div className="col-xs-12 col-sm-12 col-md-4 report-summary-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          <p>
                            <span className="card-summary-title">
                              {userCount}
                            </span>
                          </p>
                          <h4 className="card-title">employees</h4>
                          <p className="card-text">{`and ${projectCount} projects`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- Summary Cards - Assigned --> */}
              <div className="col-xs-12 col-sm-12 col-md-4 report-summary-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          <p>
                            <span className="card-summary-title">
                              {assignedUsertCount}
                            </span>
                          </p>
                          <h4 className="card-title">
                            assigned&nbsp;
                            <span className="badge badge-pill badge-warning">
                              {`${assignedUsertCountPercent}%`}
                            </span>
                          </h4>
                          <p className="card-text">{`in ${assignmentCount} assignments`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- Summary Cards - Unassigned --> */}
              <div className="col-xs-12 col-sm-12 col-md-4 report-summary-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          <p>
                            <span className="card-summary-title">
                              {unassignedUsertCount}
                            </span>
                          </p>
                          <h4 className="card-title">
                            on bench&nbsp;
                            <span className="badge badge-pill badge-warning">
                              {`${unassignedUsertCountPercent}%`}
                            </span>
                          </h4>
                          <p className="card-text">{`${unassignedProjectCount} unassigned projects`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <!-- Chart Cards - On Bench by Date --> */}
              <div className="col-xs-12 col-sm-12 col-md-12 report-chart-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          {_.size(inRangeAssignments) > 0 && (
                            <Chart
                              width="auto"
                              height="312px"
                              chartType="LineChart"
                              loader={<div>Chart loading...</div>}
                              data={chartData.benchByDateData}
                              options={{
                                fontName: 'Roboto',
                                title: `On bench by date from ${moment(
                                  startDate
                                ).format('MMM DD, YYYY')} to ${moment(
                                  endDate
                                ).format('MMM DD, YYYY')}`,
                                titleTextStyle: {
                                  fontSize: 16,
                                },
                                hAxis: {
                                  title: 'Date',
                                },
                                vAxis: {
                                  title: 'On bench employees',
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

              {/* <!-- Chart Cards - On Bench by Module --> */}
              <div className="col-xs-12 col-sm-12 col-md-6 report-chart-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          {_.size(unassignedUsers) > 0 && (
                            <Chart
                              width="auto"
                              height="300px"
                              chartType="BarChart"
                              loader={<div>Chart loading...</div>}
                              data={chartData.benchByModuleData}
                              options={{
                                fontName: 'Roboto',
                                title: 'On bench by module',
                                titleTextStyle: {
                                  fontSize: 16,
                                },
                                chartArea: { width: '50%' },
                                hAxis: {
                                  title: 'Employees',
                                  minValue: 0,
                                },
                                vAxis: {
                                  title: 'Module',
                                },
                              }}
                              // For tests
                              rootProps={{ 'data-testid': '2' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <!-- Chart Cards - On Bench by Level --> */}
              <div className="col-xs-12 col-sm-12 col-md-6 report-summary-card">
                <div className="image-flip">
                  <div className="mainflip">
                    <div className="frontside">
                      <div className="card">
                        <div className="card-body text-center">
                          {_.size(unassignedUsers) > 0 && (
                            <Chart
                              width="auto"
                              height="300px"
                              chartType="BarChart"
                              loader={<div>Chart loading...</div>}
                              data={chartData.benchByLevelData}
                              options={{
                                fontName: 'Roboto',
                                title: 'On bench by level',
                                titleTextStyle: {
                                  fontSize: 16,
                                },
                                chartArea: { width: '50%' },
                                hAxis: {
                                  title: 'Employees',
                                  minValue: 0,
                                },
                                vAxis: {
                                  title: 'Level',
                                },
                              }}
                              // For tests
                              rootProps={{ 'data-testid': '3' }}
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
        )}
      </div>
    );
  }
}

Report.defaultProps = {
  // users: null, remote example (if using ddp)
  users: null,
};

Report.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,

  projectsReady: PropTypes.bool.isRequired,
  projects: Projects ? PropTypes.array.isRequired : () => null,
  usersReady: PropTypes.bool.isRequired,
  users: Meteor.user() ? PropTypes.array.isRequired : () => null,
  assignmentsReady: PropTypes.bool.isRequired,
  assignments: Assignments ? PropTypes.array : () => null,
};

export default withTracker(() => {
  const projectsSub = Meteor.subscribe('projects.all'); // publication needs to be set on remote server
  const projects = Projects.find().fetch();
  // const project = _.findWhere(projects, { _id: props.match.params._id });
  const projectsReady = projectsSub.ready() && !!projects;

  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const usersReady = usersSub.ready() && !!users;

  const assignmentsSub = Meteor.subscribe('assignments.all'); // publication needs to be set on remote server
  const assignments = Assignments.find().fetch();
  const assignmentsReady = assignmentsSub.ready() && !!assignments;

  return {
    projectsReady,
    projects,
    usersReady,
    users,
    assignmentsReady,
    assignments,
  };
})(Report);
