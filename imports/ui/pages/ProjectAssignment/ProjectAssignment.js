import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';

// collection
import Projects from '../../../api/projects/projects';

// remote example (if using ddp)
/*
import Remote from '../../../api/remote/ddp';
import Users from '../../../api/remote/users';
*/

// components
import ProjectCard from '../../components/ProjectCard';
import EmployeeCard from '../../components/EmployeeCard';

import './ProjectAssignment.scss';

class ProjectAssignment extends React.Component {
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
    const { loggedIn, projectsReady, project, usersReady, user } = this.props;

    if (!loggedIn) {
      return null;
    }
    return (
      <div className="employee-page">
        <h1 className="mb-4">{projectsReady ? `Project ${project.projectName}` : `Project`}</h1>
        <div className="container">
          <div className="row">
            {projectsReady && usersReady && (
              <>
                <ProjectCard project={project} key={project._id} />
                <EmployeeCard user={user} key={user._id} />
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
  user: null,
};

ProjectAssignment.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  projectsReady: PropTypes.bool.isRequired,
  project: PropTypes.object,
  usersReady: PropTypes.bool.isRequired,
  user: PropTypes.object,
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

  return {
    projectsReady,
    project,
    usersReady,
    user,
  };
})(ProjectAssignment);
