import { Meteor } from 'meteor/meteor';
import React from 'react';
import { NavLink } from 'react-router-dom';

import './ProjectAddCard.scss';

const ProjectAddCard = () => (
  <div className="col-xs-12 col-sm-6 col-md-4 proj-new-card">
    <div className="image-flip">
      <div className="mainflip">
        <div className="frontside">
          <NavLink to="/project/create">
            <div className="card">
              <div className="card-body text-center">
                <p>
                  <img
                    className="img-fluid"
                    src="/img/add_icon.png"
                    alt="card image"
                  />
                </p>
                <h4 className="card-title">Create New Project</h4>
                <p className="card-text">Click to create project</p>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectAddCard;
