import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { NavLink } from 'react-router-dom';

// collection
import Projects from '../../../api/projects/projects';

import './ProjectCard.scss';

const ProjectCard = ({ project }) => (
  <div className="col-xs-12 col-sm-6 col-md-4 emp-card">
    <div className="image-flip">
      <div className="mainflip">
        <div className="frontside">
          <NavLink to={project ? `/project/${project._id}` : `/project`}>
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
                  {project ? project.projectName : ''}
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
          </NavLink>
        </div>
      </div>
    </div>
  </div>
);

ProjectCard.propTypes = {
  project: PropTypes.object,
};

export default ProjectCard;
