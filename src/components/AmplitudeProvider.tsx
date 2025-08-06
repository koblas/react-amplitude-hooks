import React, { createContext, useContext } from 'react';
import { isValidAmplitudeInstance } from '../lib/validation';
import { AmplitudeClient, Config } from 'amplitude-js';

declare type Props = {
  ///
  // should be a AmplitudeClient -- but not requiring this
  amplitudeInstance: AmplitudeClient;
  ///
  // Pass empty "" if you're testing/development
  apiKey: string;
  ///
  // User ID to identify this session with
  userId?: string;
  config?: Config;
  children: React.ReactNode;
};

declare type AmplitudeContextType = {
  amplitudeInstance?: AmplitudeClient;
  getParentContext?(): AmplitudeContextType;
  eventProperties?: Record<string, unknown>;
};

export const AmplitudeContext = createContext<AmplitudeContextType>({
  eventProperties: {},
});

export function useAmplitudeContext() {
  return useContext(AmplitudeContext);
}

function initAmplitude(
  amplitudeInstance: AmplitudeClient,
  apiKey: string,
  userId?: string,
  config?: Config,
) {
  return () => {
    if (isValidAmplitudeInstance(amplitudeInstance)) {
      if (apiKey) {
        amplitudeInstance.init(apiKey, undefined, config);
      }
      if (userId) {
        amplitudeInstance.setUserId(userId);
      }
    }
  };
}

export function AmplitudeProvider(props: Props) {
  const { amplitudeInstance, apiKey, userId, config } = props;

  // Memoize so it's only really called if the params change
  const init = initAmplitude(amplitudeInstance, apiKey, userId, config);

  // We need to init such that LogOnMount is happy
  init();

  return (
    <AmplitudeContext.Provider
      value={{
        amplitudeInstance: props.amplitudeInstance,
        eventProperties: {},
      }}
    >
      {props.children}
    </AmplitudeContext.Provider>
  );
}
