import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import './EmployeeCard.scss';

const EmployeeCard = ({ user }) => (
  <div className="col-xs-12 col-sm-6 col-md-4 emp-card">
    <div className="image-flip">
      <div className="mainflip">
        <div className="frontside">
          <div className="card">
            <div className="card-body text-center">
              <p>
                <img
                  className="img-fluid"
                  src="/img/avatar_placeholder.png"
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
                    {user ? user.profile.fullName : ''}
                    &nbsp;
                    <span className="badge badge-pill badge-warning">
                      {user.profile.posTitle}
                    </span>
                  </a>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <NavLink
                      className="dropdown-item"
                      to={user ? `/employee/${user._id}` : `/employee`}
                    >
                      Update Employee
                    </NavLink>
                    <NavLink
                      className="dropdown-item"
                      to={
                        user ? `/employee/assignment/${user._id}` : `/employee`
                      }
                    >
                      Assignments
                    </NavLink>
                  </div>
                </div>
              </h4>

              <p className="card-text">{user ? user.profile.email : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

EmployeeCard.propTypes = {
  user: PropTypes.objectOf(Meteor.user),
};

export default EmployeeCard;
