import * as React from 'react';
import { render } from '@testing-library/react';
import { LogOnChange } from './LogOnChange';
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
  render(<LogOnChange eventType="test" value={'noProviderTest'} />);
});

test('logs event on value change', () => {
  const mockLogEvent = jest.fn();

  // Create a fresh mock for each test
  (amplitude.useAmplitude as any).mockReturnValue({
    logEvent: mockLogEvent,
    instrument: jest.fn(),
    amplitudeProvider: 'test',
    eventProperties: {},
  });

  const value = { test: true };

  // First render - logEvent is called on first render due to useEffect
  const { rerender } = render(<LogOnChange eventType="test" value={value} />);

  // Verify logEvent is called on first render
  expect(mockLogEvent).toHaveBeenCalledTimes(1);
  mockLogEvent.mockClear();

  // Same value, should not trigger logEvent again
  rerender(<LogOnChange eventType="test" value={value} />);
  expect(mockLogEvent).not.toHaveBeenCalled();

  // Change value, should trigger logEvent
  const newValue = { test: false };
  rerender(<LogOnChange eventType="test" value={newValue} />);

  expect(mockLogEvent).toHaveBeenCalledTimes(1);
});
