import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { AppContextProvider } from './core/context'
import store, { persistor } from './store'

import ChatPage from './components/pages/chat'
import LandingPage from './components/pages/landing'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppContextProvider>
            <LandingPage landing={true} />
        </AppContextProvider>
  },
  {
    path: '/chat/:id',
    element: <AppContextProvider>
            <ChatPage />
        </AppContextProvider>
  },
  {
    path: '/s/:id',
    element: <AppContextProvider>
            <ChatPage share={true} />
        </AppContextProvider>
  },
  {
    path: '/s/:id/*',
    element: <AppContextProvider>
            <ChatPage share={true} />
        </AppContextProvider>
  }
])

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root container missing in index.html')

const root = ReactDOM.createRoot(rootElement)

type LocaleMessages = Record<string, string | { defaultMessage: string }>

async function loadLocaleData (locale: string): Promise<Record<string, string>> {
  const response = await fetch(`/lang/${locale}.json`)
  if (!response.ok) {
    throw new Error('Failed to load locale data')
  }

  const messages: LocaleMessages = await response.json()
  const formattedMessages: Record<string, string> = {}

  for (const key of Object.keys(messages)) {
    const message = messages[key]
    formattedMessages[key] = typeof message === 'string' ? message : message.defaultMessage
  }

  return formattedMessages
}

async function bootstrapApplication (): Promise<void> {
  const locale = navigator.language

  let messages: Record<string, string> | undefined
  try {
    messages = await loadLocaleData(locale.toLocaleLowerCase())
  } catch (e) {
    console.warn('No locale data for', locale)
  }

  root.render(
    <React.StrictMode>
      <IntlProvider locale={navigator.language} defaultLocale="en-GB" messages={messages}>
        <MantineProvider theme={{ colorScheme: 'dark' }}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ModalsProvider>
                <RouterProvider router={router} />
              </ModalsProvider>
            </PersistGate>
          </Provider>
        </MantineProvider>
      </IntlProvider>
    </React.StrictMode>
  )
}

void bootstrapApplication()
