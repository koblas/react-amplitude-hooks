import * as React from "react";
import { mount } from "enzyme";
import { LogOnChange } from "./LogOnChange";
import * as amplitude from "./Amplitude";

jest.mock("./Amplitude", () => {
  const module: any = jest.genMockFromModule("./Amplitude");

  const mock: any = {
    logEvent: jest.fn(),
    instrument: jest.fn(),
    amplitudeProvider: "test",
    eventProperties: {},
  };

  module.useAmplitude.mockReturnValue(mock);

  return module;
});

test("no provider", () => {
  mount(<LogOnChange eventType="test" value={"noProviderTest"} />);
});

test("no provider", () => {
  const mock: any = {
    logEvent: jest.fn(),
    instrument: jest.fn(),
    amplitudeProvider: "test",
    eventProperties: {},
  };

  (amplitude.useAmplitude as any).mockReturnValue(mock);

  const value = { test: true };

  // const component = shallow(<LogOnChange eventType="test" value={value} />);
  const component = mount(<LogOnChange eventType="test" value={value} />);

  component.setProps({ value });
  component.update();
  value.test = !value.test;
  component.setProps({ value });
  component.update();

  expect(mock.logEvent).toHaveBeenCalledTimes(1);
});
