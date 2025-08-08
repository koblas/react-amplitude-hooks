import React, { useEffect } from 'react';
import { useAmplitude } from './Amplitude';

type Props = {
  eventProperties?: object | (() => void);
  value: unknown;
  eventType: string;
  instanceName?: string;
  children?: React.ReactNode;
};

export const LogOnChange: React.FC<Props> = (props: Props) => {
  const { logEvent } = useAmplitude(undefined, props.instanceName);

  useEffect(() => {
    logEvent(props.eventType, props.eventProperties);
  }, [props.value, logEvent, props.eventType, props.eventProperties]);

  return props.children || null;
};
