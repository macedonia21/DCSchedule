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
          <NavLink to={user ? `/employee/${user._id}` : `/employee`}>
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
                  {user ? user.profile.fullName : ''}
                  &nbsp;
                  <span className="badge badge-pill badge-warning">
                    {user.profile.jobLevel}
                  </span>
                </h4>
                <p className="card-text">{user ? user.profile.email : ''}</p>
              </div>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  </div>
);

EmployeeCard.propTypes = {
  user: PropTypes.objectOf(Meteor.user),
};

export default EmployeeCard;
