import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';
import { Roles } from 'meteor/alanning:roles';

// collection
import Projects from '../../../api/projects/projects';

// remote example (if using ddp)
/*
import Remote from '../../../api/remote/ddp';
import Users from '../../../api/remote/users';
*/

// components
import ProjectCard from '../../components/ProjectCard';
import ProjectAddCard from '../../components/ProjectAddCard';

import './ProjectList.scss';

class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginRoles: {
        admin: false,
        projMan: false,
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
    const { loggedIn, projectsReady, projects } = this.props;
    const { loginRoles } = this.state;

    if (Meteor.userId()) {
      if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
        loginRoles.admin = true;
      }
      if (Roles.userIsInRole(Meteor.userId(), 'projman')) {
        loginRoles.projMan = true;
      }
    }

    if (!loggedIn) {
      return null;
    }
    return (
      <div className="employee-page">
        <h1 className="mb-4">Projects</h1>
        <div className="container">
          <div className="row">
            <ProjectAddCard disabled={!loginRoles.admin} />
            {projectsReady &&
              _.map(
                loginRoles.admin
                  ? projects
                  : _.filter(projects, project => {
                      return !project.disabled;
                    }),
                project => {
                  return (
                    <ProjectCard
                      project={project}
                      key={project._id}
                      isAdmin={loginRoles.admin}
                      isProjMan={loginRoles.projMan}
                    />
                  );
                }
              )}
          </div>
        </div>
      </div>
    );
  }
}

ProjectList.defaultProps = {
  // users: null, remote example (if using ddp)
  projects: null,
};

ProjectList.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  projectsReady: PropTypes.bool.isRequired,
  projects: Projects ? PropTypes.array.isRequired : () => null,
};

export default withTracker(() => {
  const projectsSub = Meteor.subscribe('projects.all'); // publication needs to be set on remote server
  const projects = Projects.find().fetch();
  const projectsReady = projectsSub.ready() && !!projects;

  return {
    projectsReady,
    projects,
  };
})(ProjectList);
