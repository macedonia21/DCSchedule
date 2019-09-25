import React from 'react';
import PropTypes from 'prop-types';

import './Landing.scss';

class Landing extends React.Component {
  componentWillMount() {
    if (this.props.loggedIn) {
      return this.props.history.push('/project');
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.loggedIn) {
      nextProps.history.push('/project');
      return false;
    }
    return true;
  }

  render() {
    if (this.props.loggedIn) {
      return null;
    }
    return (
      <div className="landing-page">
        <h1 className="text-center text-brand">
          DC
          <br />
          Resource
          <br />
          Schedule
        </h1>
        <div className="landing-image col-md-12" />
      </div>
    );
  }
}

Landing.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Landing;
