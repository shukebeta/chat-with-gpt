import { defaultModel } from "../core/chat/openai";
import { type OptionGroup } from "../core/options/option-group";

export const parameterOptions: OptionGroup = {
  id: "parameters",
  options: [
    {
      id: "model",
      defaultValue: defaultModel,
      resettable: false,
      scope: "user",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Model",
        displayByDefault: true,
        label: (value) => value,
      },
      renderProps: (value, options, context) => ({
        type: "select",
        label: "Model",
        description:
          value?.includes("32") &&
          context.intl.formatMessage(
            {
              defaultMessage:
                "Note: This model will only work if your OpenAI account has been granted you have been given access to it. <a>Request access here.</a>",
            },
            {
              a: (text: string) => (
                <a
                  href="https://openai.com/waitlist/gpt-4-api"
                  target="_blank"
                  rel="noreferer noreferrer"
                >
                  {text}
                </a>
              ),
            } as any
          ),
        options: [
          {
            label: "o1-preview",
            value: "o1-preview",
          },
          {
            label: "o1-preview-2024-09-12",
            value: "o1-preview-2024-09-12",
          },
          {
            label: "o1-mini",
            value: "o1-mini",
          },
          {
            label: "o1-mini-2024-09-12",
            value: "o1-mini-2024-09-12",
          },
          {
            label: "chatgpt-4o-latest",
            value: "chatgpt-4o-latest",
          },
          {
            label: "gpt-4o",
            value: "gpt-4o",
          },
          {
            label: "gpt-4o-2024-05-13",
            value: "gpt-4o-2024-05-13",
          },
          {
            label: "gpt-4o-2024-08-06",
            value: "gpt-4o-2024-08-06",
          },
          {
            label: "gpt-4o-mini",
            value: "gpt-4o-mini",
          },
          {
            label: "gpt-4o-mini-2024-07-18",
            value: "gpt-4o-mini-2024-07-18",
          },
          {
            label: "gpt-4-turbo (latest)",
            value: "gpt-4-turbo",
          },
          {
            label: "gpt-4-turbo-2024-04-09",
            value: "gpt-4-turbo-2024-04-09",
          },
          {
            label: "gpt-4-turbo-preview",
            value: "gpt-4-turbo-preview",
          },
          {
            label: "gpt-4-0125-preview",
            value: "gpt-4-0125-preview",
          },
          {
            label: "gpt-4-1106-preview",
            value: "gpt-4-1106-preview",
          },
          {
            label: "gpt-4",
            value: "gpt-4",
          },
          {
            label: "gpt-4-0613",
            value: "gpt-4-0613",
          },
          {
            label: "gpt-4-0314",
            value: "gpt-4-0314",
          },
          {
            label: "gpt-3.5-turbo-0125",
            value: "gpt-3.5-turbo-0125",
          },
          {
            label: "gpt-3.5-turbo",
            value: "gpt-3.5-turbo",
          },
          {
            label: "gpt-3.5-turbo-1106",
            value: "gpt-3.5-turbo-1106",
          },
          {
            label: "gpt-3.5-turbo-instruct",
            value: "gpt-3.5-turbo-instruct",
          },
        ],
      }),
    },
    {
      id: "temperature",
      defaultValue: 0.5,
      resettable: true,
      scope: "chat",
      displayOnSettingsScreen: "chat",
      displayAsSeparateSection: true,
      displayInQuickSettings: {
        name: "Temperature",
        displayByDefault: true,
        label: (value) => "Temperature: " + value.toFixed(1),
      },
      renderProps: (value, options, context) => ({
        type: "slider",
        label: "Temperature: " + value.toFixed(1),
        min: 0,
        max: 1,
        step: 0.1,
        description: context.intl.formatMessage({
          defaultMessage:
            "The temperature parameter controls the randomness of the AI's responses. Lower values will make the AI more predictable, while higher values will make it more creative.",
        }),
      }),
    },
  ],
};
