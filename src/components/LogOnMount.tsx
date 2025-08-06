import React, { useEffect } from 'react';
import { useAmplitude } from './Amplitude';

type Props = {
  eventProperties?: object | (() => void);
  eventType: string;
  instanceName?: string;
  children?: React.ReactNode;
};

export const LogOnMount: React.FC<Props> = (props: Props) => {
  const { logEvent } = useAmplitude(undefined, props.instanceName);

  useEffect(() => {
    logEvent(props.eventType, props.eventProperties);
  }, [logEvent, props.eventProperties, props.eventType]);

  return props.children || (null as any);
};
