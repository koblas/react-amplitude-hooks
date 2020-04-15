import * as React from "react";
import { mount } from "enzyme";
import { AmplitudeProvider } from "./AmplitudeProvider";
import { useAmplitude, Amplitude } from "./Amplitude";
import { AmplitudeClient } from "amplitude-js";

function buildMockAmplitude() {
  return ({
    init: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
    logEvent: jest.fn(),
  } as any) as AmplitudeClient;
}

test("basic", () => {
  const amp = buildMockAmplitude();

  function TestComponent() {
    const { logEvent } = useAmplitude((update: any) => ({
      myProp: 33,
      ...update,
    }));

    logEvent("test", {
      myProp: 33,
    });

    return <div id="foo">test</div>;
  }

  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <TestComponent />
    </AmplitudeProvider>,
  );

  expect(wrapper.find("#foo")).toHaveLength(1);
  expect(amp.logEvent).toHaveBeenCalledTimes(1);
});

test("legacy", () => {
  const amp = buildMockAmplitude();

  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <Amplitude userProperties={{ name: "John Smith" }}>
        {({ logEvent, instrument }: any) => (
          <>
            <button
              id="foo"
              onClick={() => {
                logEvent("test event");
              }}
            >
              Some Text
            </button>
            <button id="bar" onClick={instrument("test2", () => true)}>
              Some Text
            </button>
          </>
        )}
      </Amplitude>
    </AmplitudeProvider>,
  );

  expect(wrapper.find("#foo")).toHaveLength(1);
  wrapper.find("#foo").simulate("click");
  expect(wrapper.find("#bar")).toHaveLength(1);
  wrapper.find("#bar").simulate("click");
  expect(amp.logEvent).toHaveBeenCalledTimes(2);
});

test("missing context", () => {
  function TestComponent() {
    const { logEvent } = useAmplitude({ someAttr: 77 });

    logEvent("test");

    return <div id="foo">test</div>;
  }

  const wrapper = mount(<TestComponent />);

  expect(wrapper.find("#foo")).toHaveLength(1);
});
