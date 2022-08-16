import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const getConfigsFromStorage = function () {
  return new Promise(resolve => {
    // mock
    // resolve([
    //   {
    //       "auto": false,
    //       "content": "const iframeDoc = document.querySelector('iframe').contentWindow.document;\nconst cards = iframeDoc.querySelectorAll('section[title=图文列表卡片]');\nconst unChangeIndex = [0];\n[...cards].forEach((card, index) => {\n    if (unChangeIndex.includes(index)) { return }\n    const imgs = card.querySelectorAll('img');\n    [...imgs].forEach(img => {\n        console.log(img.style)\n        img.style.margin = '0 auto'\n        img.style.border = '1px solid rgba(70, 83, 115, 0.5)'\n        img.style.borderRadius = '4px'\n        img.style.width = '200px'\n        img.style.height = 'auto'\n    })\n})",
    //       "id": 1653817864680,
    //       "name": "调整封面尺寸",
    //       "page": "mp.weixin.qq.com",
    //       "type": "script"
    //   }
    // ])
    chrome.storage.sync.get('pageConfigs', (storage) => {
      const result = storage && storage.pageConfigs || []
      resolve(result)
    })
  })
}

const getDeveloperStatusFromStorage = function() {
  return new Promise(resolve => {
    // mock
    // resolve(false)
    chrome.storage.sync.get('developerMode', (storage) => {
      const result = storage && storage.developerMode || false
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
  const isDeveloper = await getDeveloperStatusFromStorage()
  const location = await getCurrentLocation()
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App configs={ configs } location={ location } isDeveloper={ isDeveloper }/>)
}

init()



