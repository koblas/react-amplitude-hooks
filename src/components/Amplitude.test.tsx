import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AmplitudeProvider } from './AmplitudeProvider';
import { useAmplitude, Amplitude } from './Amplitude';
import { AmplitudeClient } from 'amplitude-js';

function buildMockAmplitude() {
  return {
    init: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
    logEvent: jest.fn(),
  } as any as AmplitudeClient;
}

test('basic', () => {
  const amp = buildMockAmplitude();

  function TestComponent() {
    const { logEvent } = useAmplitude((update: any) => ({
      myProp: 33,
      ...update,
    }));

    logEvent('test', {
      myProp: 33,
    });

    return <div data-testid="foo">test</div>;
  }

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <TestComponent />
    </AmplitudeProvider>,
  );

  expect(screen.getByTestId('foo')).toBeInTheDocument();
  expect(amp.logEvent).toHaveBeenCalledTimes(1);
});

test('legacy', () => {
  const amp = buildMockAmplitude();

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <Amplitude userProperties={{ name: 'John Smith' }}>
        {({ logEvent, instrument }: any) => (
          <>
            <button
              data-testid="foo"
              onClick={() => {
                logEvent('test event');
              }}
            >
              Some Text
            </button>
            <button data-testid="bar" onClick={instrument('test2', () => true)}>
              Some Text
            </button>
          </>
        )}
      </Amplitude>
    </AmplitudeProvider>,
  );

  expect(screen.getByTestId('foo')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('foo'));
  expect(screen.getByTestId('bar')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('bar'));
  expect(amp.logEvent).toHaveBeenCalledTimes(2);
});

test('missing context', () => {
  function TestComponent() {
    const { logEvent } = useAmplitude({ someAttr: 77 });

    logEvent('test');

    return <div data-testid="foo">test</div>;
  }

  render(<TestComponent />);

  expect(screen.getByTestId('foo')).toBeInTheDocument();
});
