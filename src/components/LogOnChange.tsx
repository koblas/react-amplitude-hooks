import * as PropTypes from "prop-types";
import * as React from "react";
import { useAmplitude } from "./Amplitude";

type Props = {
  eventProperties: object | Function;
  eventType: string;
  instanceName?: string;
  children: React.ReactNode;
};

export function LogOnChange(props: Props) {
  const { logEvent } = useAmplitude(props.instanceName);

  React.useEffect(function() {
    logEvent(props.eventType, props.eventProperties);
  });

  return props.children || null;
}

LogOnChange.propTypes = {
  debounceInterval: PropTypes.number,
  eventProperties: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  eventType: PropTypes.string.isRequired,
  instanceName: PropTypes.string,
  value: PropTypes.any
};
