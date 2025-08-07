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
  } as unknown as AmplitudeClient;
}

test('basic', () => {
  const amp = buildMockAmplitude();

  function TestComponent() {
    const { logEvent } = useAmplitude((update: Record<string, unknown>) => ({
      myProp: 33,
      ...update,
    }));

    logEvent('test', {
      myProp: 33,
    });

    return <div>test</div>;
  }

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <TestComponent />
    </AmplitudeProvider>,
  );

  expect(screen.getByText('test')).toBeInTheDocument();
  expect(amp.logEvent).toHaveBeenCalledTimes(1);
});

test('legacy', () => {
  const amp = buildMockAmplitude();

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <Amplitude userProperties={{ name: 'John Smith' }}>
        {({
          logEvent,
          instrument,
        }: {
          logEvent: (eventType: string, eventProperties?: object) => void;
          instrument: (eventType: string, func: () => boolean) => () => boolean;
        }) => (
          <>
            <button
              onClick={() => {
                logEvent('test event');
              }}
            >
              Test Log-Event CTA
            </button>
            <button onClick={instrument('test2', () => true)}>
              Test Instrument CTA
            </button>
          </>
        )}
      </Amplitude>
    </AmplitudeProvider>,
  );

  const logEventCTA = screen.getByRole('button', {name: /test log-event cta/i})
  expect(logEventCTA).toBeInTheDocument();
  fireEvent.click(logEventCTA);

  const instrumentCTA = screen.getByRole('button', {name: /test instrument cta/i})
  expect(instrumentCTA).toBeInTheDocument();
  fireEvent.click(instrumentCTA);
  expect(amp.logEvent).toHaveBeenCalledTimes(2);
});

test('missing context', () => {
  function TestComponent() {
    const { logEvent } = useAmplitude({ someAttr: 77 });

    logEvent('test');

    return <div data-testid="foo">test</div>;
  }

  render(<TestComponent />);

  expect(screen.getByText("test")).toBeInTheDocument();
});

test('when eventProperties is falsy and children is falsy - returns null', () => {
  const amp = buildMockAmplitude();
  const { container } = render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <Amplitude eventProperties={undefined}>{null}</Amplitude>
    </AmplitudeProvider>,
  );

  // The component should render nothing (null)
  expect(container.firstChild).toBeNull();
});

test('logEvent with eventPropertiesIn as a function', () => {
  const amp = buildMockAmplitude();

  function TestComponent() {
    const { logEvent } = useAmplitude({ baseProperty: 'base' });

    // Using a function as eventPropertiesIn
    logEvent('test', (computed: Record<string, unknown>) => ({
      ...computed,
      additionalProperty: 'added',
    }));

    return <div>test with function props</div>;
  }

  render(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <TestComponent />
    </AmplitudeProvider>,
  );

  expect(screen.getByText('test with function props')).toBeInTheDocument();
  expect(amp.logEvent).toHaveBeenCalledTimes(1);
  expect(amp.logEvent).toHaveBeenCalledWith(
    'test',
    expect.objectContaining({
      baseProperty: 'base',
      additionalProperty: 'added',
    }),
    undefined,
  );
});
