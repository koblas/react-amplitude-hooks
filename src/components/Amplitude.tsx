import React, { useMemo } from 'react';
import { useAmplitudeContext, AmplitudeContext } from './AmplitudeProvider';

type LogEventFunction = <T extends string>(
  eventType: T,
  eventPropertiesIn?: object,
  callback?: Callback,
) => void;

type InstrumentFunction = <T extends (...args: unknown[]) => void>(eventType: string, func: T) => T;

type Props = {
  children:
    | ((props: { logEvent: LogEventFunction; instrument: InstrumentFunction }) => React.ReactNode)
    | React.ReactNode;
  eventProperties?: object | (() => void);
  instanceName?: string;
  userProperties?: object;
};

export type Callback = (
  responseCode: number,
  responseBody: string,
  details?: { reason: string },
) => void;

export function useAmplitude(eventProperties: object = {}, instanceName?: string) {
  const defaultInstanceName = instanceName /* istanbul ignore next */ || '$default_instance';
  const { amplitudeInstance, eventProperties: inheritedProperties } = useAmplitudeContext();

  return useMemo(() => {
    function logEvent<T extends string>(
      eventType: T,
      eventPropertiesIn: object = {},
      callback?: Callback,
    ) {
      if (!amplitudeInstance) {
        return;
      }

      let computed = inheritedProperties;
      if (typeof eventProperties === 'function') {
        computed = eventProperties(computed);
      } else {
        computed = { ...computed, ...eventProperties };
      }

      if (typeof eventPropertiesIn === 'function') {
        computed = eventPropertiesIn(computed);
      } else {
        computed = { ...computed, ...eventPropertiesIn };
      }

      amplitudeInstance.logEvent(eventType, computed, callback);
    }

    function instrument<T extends (...args: unknown[]) => void>(eventType: string, func: T): T {
      function fn(...params: unknown[]) {
        const retVal = func ? func(...params) : /* istanbul ignore next */ undefined;
        logEvent(eventType);
        return retVal;
      }
      return fn as T;
    }

    return {
      logEvent: logEvent,
      instrument: instrument,
      eventProperties: inheritedProperties,
      amplitudeInstance: amplitudeInstance,
    };
    // `defaultInstanceName` is intentionally included in the dependency array
    // to allow future support for dynamic amplitude instance switching.
    // Although it's not directly used in this memo block yet,
    // we keep it here for semantic clarity and to prevent subtle bugs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventProperties, amplitudeInstance, inheritedProperties, defaultInstanceName]);
}

export function Amplitude(props: Props) {
  const { logEvent, instrument, eventProperties, amplitudeInstance } = useAmplitude(
    undefined,
    props.instanceName,
  );

  // This is API compatible with Amplitude's API, but weird when you think about it
  useMemo(
    () => () => {
      if (props.userProperties && amplitudeInstance) {
        amplitudeInstance.setUserProperties(props.userProperties);
      }
    },
    [props.userProperties, amplitudeInstance],
  )();

  // Memoizes the value prop object to avoid re-renders when eventProperties or amplitudeInstance don't change
  const value = useMemo(
    () => ({
      eventProperties: { ...eventProperties, ...(props.eventProperties || {}) },
      amplitudeInstance,
    }),
    [eventProperties, props.eventProperties, amplitudeInstance],
  );

  // If we're not providing any additional properties, just get out of the way and call the component
  /* istanbul ignore if */
  if (!eventProperties) {
    return typeof props.children === 'function'
      ? props.children({ logEvent, instrument })
      : props.children || null;
  }

  return (
    <AmplitudeContext.Provider value={value}>
      {typeof props.children === 'function'
        ? props.children({ logEvent, instrument })
        : props.children || null}
    </AmplitudeContext.Provider>
  );
}
