import * as PropTypes from "prop-types";
import * as React from "react";
import { isValidAmplitudeInstance } from "../lib/validation";
import { AmplitudeClient } from "amplitude-js";

declare type Props = {
  amplitudeInstance: AmplitudeClient;
  apiKey: string;
  userId?: string;
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

function initAmplitude(apiKey: string, userId: any, amplitudeInstance: AmplitudeClient) {
  return () => {
    if (isValidAmplitudeInstance(amplitudeInstance)) {
      if (apiKey) {
        amplitudeInstance.init(apiKey);
      }
      if (userId) {
        amplitudeInstance.setUserId(userId);
      }
    }
  };
}

export function AmplitudeProvider(props: Props) {
  const { apiKey, userId, amplitudeInstance } = props;

  // Memoize so it's only really called if the params change
  const init = React.useMemo(() => initAmplitude(apiKey, userId, amplitudeInstance), [
    apiKey,
    userId,
    amplitudeInstance
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
  userId: PropTypes.string
};
