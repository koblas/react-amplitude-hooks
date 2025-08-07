import * as React from 'react';
import { render, screen } from '@testing-library/react';
import * as validation from '../lib/validation';
import { AmplitudeProvider, useAmplitudeContext } from './AmplitudeProvider';
import { AmplitudeClient } from 'amplitude-js';

function buildMockAmplitude() {
  return {
    init: jest.fn(),
    setUserId: jest.fn(),
    logEvent: jest.fn(),
  } as unknown as AmplitudeClient;
}

test('basic', () => {
  const isValid = jest.spyOn(validation, 'isValidAmplitudeInstance');

  const amp = buildMockAmplitude();
  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <div>text</div>
    </AmplitudeProvider>,
  );

  expect(isValid).toHaveBeenCalledTimes(1);
  expect(amp.init).toHaveBeenCalledTimes(1);
  expect(screen.getByText('text')).toBeInTheDocument();
});

test('no-api key', () => {
  const amp = buildMockAmplitude();
  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="">
      <div>text</div>
    </AmplitudeProvider>,
  );

  expect(amp.init).toHaveBeenCalledTimes(0);
  expect(screen.getByText('text')).toBeInTheDocument();
});

test('non-valid instance', () => {
  const amp = {} as unknown as AmplitudeClient;
  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <div>text</div>
    </AmplitudeProvider>,
  );

  expect(screen.getByText('text')).toBeInTheDocument();
});

test('with user', () => {
  const amp = buildMockAmplitude();
  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234" userId="789">
      <div>text</div>
    </AmplitudeProvider>,
  );

  expect(screen.getByText('text')).toBeInTheDocument();
  expect(amp.setUserId).toHaveBeenCalledTimes(1);
});

test('useAmplitudeContext hook', () => {
  const amp = buildMockAmplitude();

  // Create a test component that uses the hook
  function TestComponent() {
    const context = useAmplitudeContext();

    // Render the context values to verify they're correct
    return (
      <div>
        <div role="status" aria-label="instance status">{context.amplitudeInstance ? 'true' : 'false'}</div>
        <div role="status" aria-label="properties status">
          {Object.keys(context.eventProperties || {}).length === 0 ? 'empty' : 'has-props'}
        </div>
      </div>
    );
  }

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <TestComponent />
    </AmplitudeProvider>,
  );

  // Verify the context values are correctly passed through the hook
  expect(screen.getByRole('status', { name: 'instance status' })).toHaveTextContent('true');
  expect(screen.getByRole('status', { name: 'properties status' })).toHaveTextContent('empty');
});
