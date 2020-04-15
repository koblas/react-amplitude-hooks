import * as PropTypes from "prop-types";
import * as React from "react";
import { useAmplitudeContext, AmplitudeContext } from "./AmplitudeProvider";

type Props = {
  children: Function | React.ReactNode;
  eventProperties?: object | Function;
  instanceName?: string;
  userProperties?: object;
};

export function useAmplitude(eventProperties: object = {}, instanceName: string = "$default_instance") {
  const { amplitudeInstance, eventProperties: inheritedProperties } = useAmplitudeContext();

  return React.useMemo(() => {
    function logEvent(eventType: string, eventPropertiesIn: object = {}, callback?: any) {
      if (!amplitudeInstance) {
        return;
      }

      let computed = inheritedProperties;
      if (typeof eventProperties === "function") {
        computed = eventProperties(computed);
      } else {
        computed = { ...computed, ...(eventProperties || {}) };
      }
      if (typeof eventPropertiesIn === "function") {
        computed = eventPropertiesIn(computed);
      } else {
        computed = { ...computed, ...(eventPropertiesIn || {}) };
      }

      amplitudeInstance.logEvent(eventType, computed, callback);
    }

    function instrument<T extends Function>(eventType: string, func: T): T {
      function fn(...params: any) {
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
      amplitudeInstance: amplitudeInstance
    };
  }, [eventProperties, amplitudeInstance, inheritedProperties, instanceName]);
}

export function Amplitude(props: Props) {
  const { logEvent, instrument, eventProperties, amplitudeInstance } = useAmplitude(undefined, props.instanceName);

  // This is API compatible with Amplitude's API, but weird when you think about it
  React.useMemo(
    () => () => {
      if (props.userProperties && amplitudeInstance) {
        amplitudeInstance.setUserProperties(props.userProperties);
      }
    },
    [props.userProperties, amplitudeInstance]
  )();

  // If we're not providng any additional properties, just get out of the way and call the component
  if (!eventProperties) {
    return typeof props.children === "function" ? props.children({ logEvent, instrument }) : props.children || null;
  }

  return (
    <AmplitudeContext.Provider
      value={{ eventProperties: { ...eventProperties, ...(props.eventProperties || {}) }, amplitudeInstance }}
    >
      {typeof props.children === "function" ? props.children({ logEvent, instrument }) : props.children || null}
    </AmplitudeContext.Provider>
  );
}

Amplitude.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  eventProperties: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  debounceInterval: PropTypes.number,
  instanceName: PropTypes.string,
  userProperties: PropTypes.object
};
