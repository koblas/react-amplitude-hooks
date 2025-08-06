import React, { useMemo } from 'react';
import { useAmplitudeContext, AmplitudeContext } from './AmplitudeProvider';

type Props = {
  children: ((props: { logEvent: any; instrument: any }) => React.ReactNode) | React.ReactNode;
  eventProperties?: object | (() => void);
  instanceName?: string;
  userProperties?: object;
};

export type Callback = (
  responseCode: number,
  responseBody: string,
  details?: { reason: string },
) => void;

export function useAmplitude(
  eventProperties: object = {},
  instanceName: string = '$default_instance',
) {
  const { amplitudeInstance, eventProperties: inheritedProperties } = useAmplitudeContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        computed = { ...computed, ...(eventProperties || {}) };
      }
      if (typeof eventPropertiesIn === 'function') {
        computed = eventPropertiesIn(computed);
      } else {
        computed = { ...computed, ...(eventPropertiesIn || {}) };
      }

      amplitudeInstance.logEvent(eventType, computed, callback);
    }

    function instrument<T extends (...args: any[]) => void>(eventType: string, func: T): T {
      function fn(...params: any[]) {
        const retVal = func ? func(...params) : undefined;
        logEvent(eventType);
        return retVal;
      }
      return fn as any;
    }

    return {
      logEvent: logEvent,
      instrument: instrument,
      eventProperties: inheritedProperties,
      amplitudeInstance: amplitudeInstance,
    };
    // `instanceName` is intentionally included in the dependency array
    // to allow future support for dynamic amplitude instance switching.
    // Although it's not directly used in this memo block yet,
    // we keep it here for semantic clarity and to prevent subtle bugs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventProperties, amplitudeInstance, inheritedProperties, instanceName]);
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
