export function isValidAmplitudeInstance(maybeInstance: any) {
    return !!maybeInstance && typeof maybeInstance.init === "function" && typeof maybeInstance.logEvent === "function";
}
