import * as React from 'react';
import { render } from '@testing-library/react';
import { LogOnMount } from './LogOnMount';
import * as amplitude from './Amplitude';

jest.mock('./Amplitude', () => ({
  useAmplitude: jest.fn().mockReturnValue({
    logEvent: jest.fn(),
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  }),
}));

test('no provider - simple render', () => {
  render(<LogOnMount eventType="test" />);
});

test('logs event on mount', () => {
  const mockLogEvent = jest.fn();

  // Create a fresh mock for each test
  (amplitude.useAmplitude as jest.Mock).mockReturnValue({
    logEvent: mockLogEvent,
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  });

  // Render component
  render(<LogOnMount eventType="test-event" />);

  // Verify logEvent is called on mount
  expect(mockLogEvent).toHaveBeenCalledTimes(1);
  expect(mockLogEvent).toHaveBeenCalledWith('test-event', undefined);
});

test('logs event with properties', () => {
  const mockLogEvent = jest.fn();
  const eventProperties = { property1: 'value1', property2: 'value2' };

  // Create a fresh mock for each test
  (amplitude.useAmplitude as jest.Mock).mockReturnValue({
    logEvent: mockLogEvent,
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  });

  // Render component with event properties
  render(<LogOnMount eventType="test-event" eventProperties={eventProperties} />);

  // Verify logEvent is called with correct parameters
  expect(mockLogEvent).toHaveBeenCalledTimes(1);
  expect(mockLogEvent).toHaveBeenCalledWith('test-event', eventProperties);
});

test('renders children', () => {
  const mockLogEvent = jest.fn();

  // Create a fresh mock for each test
  (amplitude.useAmplitude as jest.Mock).mockReturnValue({
    logEvent: mockLogEvent,
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  });

  // Render component with children
  const { getByTestId } = render(
    <LogOnMount eventType="test-event">
      <div data-testid="child">Child content</div>
    </LogOnMount>,
  );

  // Verify children are rendered
  expect(getByTestId('child')).toBeInTheDocument();
});

test('uses specified instance name', () => {
  const mockLogEvent = jest.fn();

  // Create a fresh mock for each test
  (amplitude.useAmplitude as jest.Mock).mockReturnValue({
    logEvent: mockLogEvent,
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  });

  // Render component with instance name
  render(<LogOnMount eventType="test-event" instanceName="custom-instance" />);

  // Verify useAmplitude was called with the correct instance name
  expect(amplitude.useAmplitude).toHaveBeenCalledWith(undefined, 'custom-instance');
});
