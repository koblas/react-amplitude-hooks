import * as PropTypes from "prop-types";
import * as React from "react";
import { useAmplitude } from "./Amplitude";

type Props = {
  eventProperties?: object | Function;
  eventType: string;
  instanceName?: string;
  children?: React.ReactNode;
};

export const LogOnMount: React.StatelessComponent<Props> = (props: Props) => {
  const { logEvent, amplitudeInstance } = useAmplitude(undefined, props.instanceName);

  React.useEffect(() => {
    logEvent(props.eventType, props.eventProperties);
  }, [props.eventType, props.eventProperties, amplitudeInstance]);

  return props.children || (null as any);
};

LogOnMount.propTypes = {
  eventProperties: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  eventType: PropTypes.string.isRequired,
  instanceName: PropTypes.string
};
