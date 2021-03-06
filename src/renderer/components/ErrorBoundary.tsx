import React from 'react';

type Props = {
  fallback: (error: Error, sentryEventId?: string) => React.ReactNode;
  children: React.ReactNode;
};
type State = {
  error?: Error;
  eventId?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: Record<string, any>) {
    // do nothing
  }
  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback(error, this.state.eventId);
    }
    return this.props.children;
  }
}
