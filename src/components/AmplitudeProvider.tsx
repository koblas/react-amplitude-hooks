import * as PropTypes from "prop-types";
import * as React from "react";
import { isValidAmplitudeInstance } from "../lib/validation";
import { AmplitudeClient } from "amplitude-js";

declare type Props = {
  amplitudeInstance: AmplitudeClient;
  apiKey: string;
  userId: string;
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

export function AmplitudeProvider(props: Props) {
  React.useEffect(
    function() {
      if (isValidAmplitudeInstance(props.amplitudeInstance)) {
        if (props.apiKey) {
          props.amplitudeInstance.init(props.apiKey);
        }
        if (props.userId) {
          props.amplitudeInstance.setUserId(props.userId);
        }
      } else {
        console.error('AmplitudeProvider was not provided with a valid "amplitudeInstance" prop.');
      }
    },
    [props.apiKey, props.userId, props.amplitudeInstance]
  );

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
