import { type OpenAIMessage } from '../chat/types'
import * as tokenizer from '.'

export interface ChatHistoryTrimmerOptions {
  maxCompletionTokens: number
  nMostRecentMessages?: number
  preserveSystemPrompt: boolean
  preserveFirstUserMessage: boolean
}

export class ChatHistoryTrimmer {
  private output: OpenAIMessage[] = []

  constructor (private readonly messages: OpenAIMessage[],
    private readonly options: ChatHistoryTrimmerOptions) {
  }

  private countExcessTokens () {
    return Math.max(0, tokenizer.countTokensForMessages(this.output) - this.options.maxCompletionTokens)
  }

  public process () {
    this.output = this.messages.map(m => ({ ...m }))

    if (this.options.nMostRecentMessages) {
      this.output = this.removeUnwantedMessagesStrategy()
    }

    let excessTokens = this.countExcessTokens()

    if (excessTokens === 0) {
      return this.output
    }

    this.output = this.removeMessagesStrategy()

    excessTokens = this.countExcessTokens()
    if (excessTokens === 0) {
      return this.output
    }

    this.output = this.trimMessagesStrategy(excessTokens)

    excessTokens = this.countExcessTokens()
    if (excessTokens === 0) {
      return this.output
    }

    const systemPrompt = this.messages.find(m => m.role === 'system')
    const firstUserMessage = this.messages.find(m => m.role === 'user')
    const last = this.messages[this.messages.length - 1]

    this.output = []

    // If there is a system prompt and we want to preserve it, add it to the output
    if (systemPrompt && this.options.preserveSystemPrompt) {
      this.output.push(tokenizer.truncateMessage(systemPrompt, 100))
    }

    // Handle the first user message and the last message based on the conditions
    if (firstUserMessage && this.options.preserveFirstUserMessage) {
      if (firstUserMessage === last) {
        this.output.push(tokenizer.truncateMessage(firstUserMessage, this.options.maxCompletionTokens - 100));
      } else {
        this.output.push(tokenizer.truncateMessage(firstUserMessage, 100));
        if (last) {
          this.output.push(tokenizer.truncateMessage(last, this.options.maxCompletionTokens - 200));
        }
      }
    } else if (last) {
      // If we're not preserving the first user message, just add the last message
      this.output.push(tokenizer.truncateMessage(last, this.options.maxCompletionTokens));
    }

    excessTokens = this.countExcessTokens()
    if (excessTokens === 0) {
      return this.output
    }

    this.output = [
      tokenizer.truncateMessage(last, this.options.maxCompletionTokens)
    ]

    return this.output
  }

  private removeUnwantedMessagesStrategy () {
    const systemPromptIndex = this.messages.findIndex(m => m.role === 'system')
    const firstUserMessageIndex = this.messages.findIndex(m => m.role === 'user')
    const keepFromIndex = this.messages.length - (this.options.nMostRecentMessages || 1)

    const output: OpenAIMessage[] = []

    for (let i = 0; i < this.output.length; i++) {
      if (i === systemPromptIndex && this.options.preserveSystemPrompt) {
        output.push(this.output[i])
      } else if (i === firstUserMessageIndex && this.options.preserveFirstUserMessage) {
        output.push(this.output[i])
      } else if (i >= keepFromIndex) {
        output.push(this.output[i])
      }
    }

    return output
  }

  private removeMessagesStrategy () {
    const systemPromptIndex = this.messages.findIndex(m => m.role === 'system')
    const firstUserMessageIndex = this.messages.findIndex(m => m.role === 'user')
    const lastMessageIndex = this.messages.length - 1

    const output: OpenAIMessage[] = [...this.output]

    for (let i = 0; i < this.output.length && tokenizer.countTokensForMessages(output) > this.options.maxCompletionTokens; i++) {
      if (i === lastMessageIndex) {
        continue
      }
      if (i === systemPromptIndex || this.options.preserveSystemPrompt) {
        continue
      }
      if (i === firstUserMessageIndex || this.options.preserveFirstUserMessage) {
        continue
      }
      output[i].content = ''
    }

    return output.filter(m => m.content.length > 0)
  }

  private trimMessagesStrategy (excessTokens: number) {
    const systemPromptIndex = this.output.findIndex(m => m.role === 'system')
    const firstUserMessageIndex = this.output.findIndex(m => m.role === 'user')
    const lastMessageIndex = this.output.length - 1

    const output: OpenAIMessage[] = [...this.output]
    const truncateLength = Math.floor(excessTokens / this.output.length)

    for (let i = 0; i < this.output.length && tokenizer.countTokensForMessages(output) > this.options.maxCompletionTokens; i++) {
      if (i === lastMessageIndex) {
        continue
      }
      if (i === systemPromptIndex && this.options.preserveSystemPrompt) {
        continue
      }
      if (i === firstUserMessageIndex && this.options.preserveFirstUserMessage) {
        continue
      }
      output[i] = tokenizer.truncateMessage(output[i], truncateLength)
    }
    return output.filter(m => m.content.length > 0)
  }
}
