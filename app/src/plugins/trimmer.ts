import Plugin from '../core/plugins'
import { type PluginDescription } from '../core/plugins/plugin-description'
import { type OpenAIMessage, type Parameters } from '../core/chat/types'
import { maxCompletionTokensByModel } from '../core/chat/openai'
import { countTokens, runChatTrimmer } from '../core/tokenizer/wrapper'

export interface ContextTrimmerPluginOptions {
  maxCompletionTokens: number
  maxMessages: number | null
  preserveSystemPrompt: boolean
  preserveFirstUserMessage: boolean
}

export class ContextTrimmerPlugin extends Plugin<ContextTrimmerPluginOptions> {
  describe (): PluginDescription {
    return {
      id: 'context-trimmer',
      name: 'Message Context',
      options: [
        {
          id: 'maxCompletionTokens',
          displayOnSettingsScreen: 'chat',
          defaultValue: 4096,
          scope: 'chat',
          renderProps: (value, options) => ({
            label: `Include a maximum of ${value} tokens`,
            type: 'slider',
            min: 512,
            max: maxCompletionTokensByModel[options.getOption('parameters', 'model')] || 4096,
            step: 64
          }),
          validate: (value, options) => {
            const max = maxCompletionTokensByModel[options.getOption('parameters', 'model')] || 4096
            return value <= max
          },
          displayInQuickSettings: {
            name: 'Max Tokens',
            displayByDefault: true,
            label: value => `Max tokens: ${value}`
          }
        },
        // {
        //     id: 'maxMessages',
        //     displayOnSettingsScreen: "chat",
        //     defaultValue: null,
        //     scope: "chat",
        //     renderProps: (value) => ({
        //         label: `Include only the last ${value || 'N'} messages (leave blank for all)`,
        //         type: "number",
        //         min: 1,
        //         max: 10,
        //         step: 1,
        //     }),
        //     displayInQuickSettings: {
        //         name: "Max Messages",
        //         displayByDefault: false,
        //         label: value => `Include ${value ?? 'all'} messages`,
        //     },
        // },
        {
          id: 'preserveSystemPrompt',
          displayOnSettingsScreen: 'chat',
          defaultValue: true,
          scope: 'chat',
          renderProps: {
            label: 'Try to always include the System Prompt',
            type: 'checkbox'
          }
        },
        {
          id: 'preserveFirstUserMessage',
          displayOnSettingsScreen: 'chat',
          defaultValue: true,
          scope: 'chat',
          renderProps: {
            label: 'Try to always include your first message',
            type: 'checkbox'
          }
        }
      ]
    }
  }

  async preprocessModelInput (messages: OpenAIMessage[], parameters: Parameters): Promise<{ messages: OpenAIMessage[], parameters: Parameters }> {
    const before = await countTokens(messages)

    const options = this.options

    const trimmed = await runChatTrimmer(messages, {
      maxCompletionTokens: options?.maxCompletionTokens ?? 4096,
      nMostRecentMessages: options?.maxMessages ?? undefined,
      preserveFirstUserMessage: options?.preserveFirstUserMessage || true,
      preserveSystemPrompt: options?.preserveSystemPrompt || true
    })

    const after = await countTokens(trimmed)

    const diff = after - before
    console.log(`[context trimmer] trimmed ${diff} tokens from context`)

    return {
      messages: trimmed,
      parameters
    }
  }
}
