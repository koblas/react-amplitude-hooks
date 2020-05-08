import * as PropTypes from "prop-types";
import * as React from "react";
import { useAmplitude } from "./Amplitude";

type Props = {
  eventProperties?: object | Function;
  value: any;
  eventType: string;
  instanceName?: string;
  children?: React.ReactNode;
};

export const LogOnChange: React.StatelessComponent<Props> = (props: Props) => {
  const { logEvent } = useAmplitude(undefined, props.instanceName);

  React.useEffect(() => {
    logEvent(props.eventType, props.eventProperties);
  }, [props.value]);

  return props.children || (null as any);
};

LogOnChange.propTypes = {
  // debounceInterval: PropTypes.number,
  eventProperties: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  eventType: PropTypes.string.isRequired,
  instanceName: PropTypes.string,
  value: PropTypes.any,
};
