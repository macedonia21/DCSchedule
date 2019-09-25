import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { NavLink } from 'react-router-dom';

// collection
import Projects from '../../../api/projects/projects';

import './ProjectCard.scss';

const ProjectCard = ({ project }) => (
  <div className="col-xs-12 col-sm-6 col-md-4 proj-card">
    <div className="image-flip">
      <div className="mainflip">
        <div className="frontside">
          <div className="card">
            <div className="card-body text-center">
              <p>
                <img
                  className="img-fluid"
                  src="/img/project_placeholder.png"
                  alt="card image"
                />
              </p>

              <h4 className="card-title text-info">
                <div className="dropdown">
                  <a
                    className="dropdown-toggle"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {project ? project.projectName : ''}
                  </a>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <NavLink
                      className="dropdown-item"
                      to={project ? `/project/${project._id}` : `/project`}
                    >
                      Update Project
                    </NavLink>
                    <NavLink
                      className="dropdown-item"
                      to={project ? `/project/assignment/${project._id}` : `/project`}
                    >
                      Assignments
                    </NavLink>
                  </div>
                </div>
              </h4>

              <p className="card-text">
                {project
                  ? `${moment(project.startDate).format(
                      'MMM DD, YYYY'
                    )} - ${moment(project.endDate).format('MMM DD, YYYY')}`
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

ProjectCard.propTypes = {
  project: PropTypes.object,
};

export default ProjectCard;
