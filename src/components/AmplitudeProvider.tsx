import * as PropTypes from "prop-types";
import * as React from "react";
import { isValidAmplitudeInstance } from "../lib/validation";
import {AmplitudeClient, Config} from "amplitude-js";

declare type Props = {
  amplitudeInstance: AmplitudeClient;
  apiKey: string;
  userId?: string;
  config?: Config;
  children: React.ReactNode;
};

declare type AmplitudeContextType = {
  amplitudeInstance?: AmplitudeClient;
  getParentContext?(): AmplitudeContextType;
  eventProperties?: any;
};

export const AmplitudeContext = React.createContext<AmplitudeContextType>({
  eventProperties: {}
});

export function useAmplitudeContext() {
  return React.useContext(AmplitudeContext);
}

function initAmplitude(amplitudeInstance: AmplitudeClient, apiKey: string, userId?: string, config?: Config) {
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
  const init = React.useMemo(() => initAmplitude(amplitudeInstance, apiKey, userId, config), [
    amplitudeInstance,
    apiKey,
    userId,
    config,
  ]);

  // We need to init such that LogOnMount is happy
  init();

  return (
    <AmplitudeContext.Provider
      value={{
        amplitudeInstance: props.amplitudeInstance,
        eventProperties: {}
      }}
    >
      {props.children}
    </AmplitudeContext.Provider>
  );
}

AmplitudeProvider.propTypes = {
  amplitudeInstance: PropTypes.object.isRequired,
  apiKey: PropTypes.string,
  userId: PropTypes.string,
  config: PropTypes.object
};
