import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const getConfigsFromStorage = function () {
  return new Promise(resolve => {
    chrome.storage.sync.get('pageConfigs', (storage) => {
      const result = storage && storage.pageConfigs || []
      resolve(result)
    })
  })
}

const getCurrentHostName = function() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "location" }, location => {
        resolve(location ? location.hostname.replace('www.', '') : '')
      })
    })
  })
}

const init = async function () {
  const configs = await getConfigsFromStorage()
  const hostname = await getCurrentHostName()
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App configs={ configs } hostname={ hostname } />)
}

init()



