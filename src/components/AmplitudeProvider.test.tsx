import * as React from "react";
import { mount } from "enzyme";
import * as validation from "../lib/validation";
import { AmplitudeProvider } from "./AmplitudeProvider";
import { AmplitudeClient } from "amplitude-js";

function buildMockAmplitude() {
  return ({
    init: jest.fn(),
    setUserId: jest.fn(),
    logEvent: jest.fn(),
  } as any) as AmplitudeClient;
}

test("basic", () => {
  const isValid = jest.spyOn(validation, "isValidAmplitudeInstance");

  const amp = buildMockAmplitude();
  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <div id="item">text</div>
    </AmplitudeProvider>,
  );

  expect(isValid).toBeCalledTimes(1);
  expect(amp.init).toBeCalledTimes(1);
  expect(wrapper.find("#item")).toHaveLength(1);
});

test("no-api key", () => {
  const amp = buildMockAmplitude();
  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="">
      <div id="item">text</div>
    </AmplitudeProvider>,
  );

  expect(amp.init).toBeCalledTimes(0);
  expect(wrapper.find("#item")).toHaveLength(1);
});

test("non-valid instance", () => {
  const amp = {} as any;
  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234">
      <div id="item">text</div>
    </AmplitudeProvider>,
  );

  expect(wrapper.find("#item")).toHaveLength(1);
});

test("with user", () => {
  const amp = buildMockAmplitude();
  const wrapper = mount(
    <AmplitudeProvider amplitudeInstance={amp} apiKey="1234" userId="789">
      <div id="item">text</div>
    </AmplitudeProvider>,
  );

  expect(wrapper.find("#item")).toHaveLength(1);
  expect(amp.setUserId).toBeCalledTimes(1);
});
