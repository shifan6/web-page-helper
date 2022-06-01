import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const getConfigsFromStorage = function () {
  return new Promise(resolve => {
    // mock
    // resolve([
    //   {
    //     id: 2,
    //     name: '隐藏小组信息',
    //     page: 'common',
    //     type: 'style',
    //     content: '#group-info, .group-board { display: none }',
    //     auto: false,
    //   }
    // ])
    chrome.storage.sync.get('pageConfigs', (storage) => {
      const result = storage && storage.pageConfigs || []
      resolve(result)
    })
  })
}

const getCurrentLocation = function() {
  return new Promise((resolve, reject) => {
    // mock
    // resolve({
    //   hash: "",
    //   host: "www.douban.com",
    //   hostname: "www.douban.com",
    //   href: "https://www.douban.com/",
    //   origin: "https://www.douban.com",
    //   pathname: "/",
    //   port: "",
    //   protocol: "https:",
    // })
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "location" }, location => {
        resolve(location)
      })
    })
  })
}

const init = async function () {
  const configs = await getConfigsFromStorage()
  const location = await getCurrentLocation()
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App configs={ configs } location={ location } />)
}

init()



