interface AmplitudeInstanceLike {
  init: unknown;
  logEvent: unknown;
}

export function isValidAmplitudeInstance(maybeInstance: unknown): maybeInstance is AmplitudeInstanceLike {
  return (
    !!maybeInstance &&
    typeof (maybeInstance as AmplitudeInstanceLike).init === 'function' &&
    typeof (maybeInstance as AmplitudeInstanceLike).logEvent === 'function'
  );
}
