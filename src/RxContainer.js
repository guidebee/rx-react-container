import React from 'react';
import PropTypes from 'prop-types';

export class RxContainer extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.observable !== prevState.observable) {
      return {
        props: nextProps.initialState,
        observable: nextProps.observable,
      };
    }
    return null;
  }

  constructor(props, context) {
    super(props, context);
    this.state = { props: props.initialState, observable: props.observable };
    this.subscription = null;
  }

  componentDidMount() {
    // create subscription in componentDidMount instead of componentWillMount
    // because componentWillUnmount is not called server-side
    // which in many cases will result in memory leak
    this.subscription = this.state.observable.subscribe(props => {
      this.setState({ props });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.observable !== this.state.observable) {
      this.subscription.unsubscribe();
      this.subscription = this.props.observable.subscribe(props => {
        this.setState({ props });
      });
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return React.createElement(this.props.component, this.state.props);
  }
}

RxContainer.propTypes = {
  component: PropTypes.func.isRequired,
  observable: PropTypes.object.isRequired,
  initialState: PropTypes.object.isRequired,
};
