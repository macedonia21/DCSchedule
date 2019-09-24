import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import PropTypes from 'prop-types';

// collection
import Counters from '../../../api/counters/counters';

// remote example (if using ddp)
/*
import Remote from '../../../api/remote/ddp';
import Users from '../../../api/remote/users';
*/

// components
import EmployeeCard from '../../components/EmployeeCard';
import EmployeeAddCard from '../../components/EmployeeAddCard';

import './EmployeeList.scss';

class EmployeeList extends React.Component {
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
    const { loggedIn, usersReady, users } = this.props;

    if (!loggedIn) {
      return null;
    }
    return (
      <div className="employee-page">
        <h1 className="mb-4">Employees</h1>
        <div className="container">
          <div className="row">
            <EmployeeAddCard />
            {usersReady &&
              _.map(users, user => {
                return <EmployeeCard user={user} key={user._id} />;
              })}
          </div>
        </div>
      </div>
    );
  }
}

EmployeeList.defaultProps = {
  // users: null, remote example (if using ddp)
  users: null,
};

EmployeeList.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  usersReady: PropTypes.bool.isRequired,
  users: Meteor.user() ? PropTypes.array.isRequired : () => null,
};

export default withTracker(() => {
  const usersSub = Meteor.subscribe('users.all'); // publication needs to be set on remote server
  const users = Meteor.users.find().fetch();
  const usersReady = usersSub.ready() && !!users;

  return {
    usersReady,
    users,
  };
})(EmployeeList);
