import './App.css'
import React, { useState } from 'react'
import ConfigList from './components/ConfigList'
import ConfigDetail from './components/ConfigDetail'
import fileUtils from './utils/file'
import { message } from 'antd'

function App({ configs, location }) {
  const pageUrl = location && (location.host + location.pathname).replace('www.', '')
  const hostname = location && location.hostname.replace('www.', '')
  const [ pageConfigs, setPageConfigs ] = useState(configs || [])
  const [ view, setView ] = useState('config-list')
  const [ currentConfig, setCurrentConfig ] = useState({})
  const currentPageConfigs = pageConfigs.filter(config => {
    const { apply = 'site', page } = config
    return page === 'common' || (hostname && apply === 'site' && page.includes(hostname)) || (pageUrl && apply === 'url' && page === pageUrl)
  })

  const sendMessageToContent = function (message, config) {
    const { id, content } = config
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { message: message, data: { id, content } })
    })
  }

  const updatePageConfigStorage = function (newConfigs) {
    chrome.storage.sync.set({ 'pageConfigs': newConfigs })
  }

  const closeConfig = function (config) {
    switch (config.type) {
      case 'style':
        sendMessageToContent('removeStyle', config)
        break
      case 'script':
        sendMessageToContent('removeScript', config)
        break
    }
    config.auto = false
    setPageConfigs([...pageConfigs])
    updatePageConfigStorage(pageConfigs)
  }

  const openConfig = function (config) {
    switch (config.type) {
      case 'style':
        sendMessageToContent('addStyle', config)
        break
      case 'script':
        sendMessageToContent('addScript', config)
        break
    }
    config.auto = true
    setPageConfigs([... pageConfigs])
    updatePageConfigStorage(pageConfigs)
  }
  
  const runConfig = function (config) {
    sendMessageToContent('addScript', config)
  }

  const editConfig = function (config) {
    const { page, apply } = config
    const detail = {
      ...config,
      apply: apply || (page === 'common' && 'common') || 'site'
    }
    setView('config-detail')
    setCurrentConfig(detail)
  }

  const addConfig = function () {
    setView('config-detail')
    setCurrentConfig({
      name: '',
      type: 'style',
      page: hostname,
      apply: 'site',
      auto: false,
      content: ''
    })
  }
  
  const saveConfig = function (config) {
    const newConfigs = JSON.parse(JSON.stringify(pageConfigs))
    if (config.id) {
      const index = newConfigs.findIndex(it => it.id === config.id)
      newConfigs.splice(index, 1, config)
    } else {
      config.id = new Date().getTime()
      newConfigs.push(config)
    }
    setView('config-list')
    setPageConfigs(newConfigs)
    updatePageConfigStorage(newConfigs)
  }

  const cancelEdit = function () {
    setView('config-list')
  }

  const removeConfig = function (id) {
    const newConfigs = JSON.parse(JSON.stringify(pageConfigs))
    const index = newConfigs.findIndex(it => it.id === id)
    newConfigs.splice(index, 1)
    setView('config-list')
    setPageConfigs(newConfigs)
    updatePageConfigStorage(newConfigs)
  }
  
  const importConfig = function (file) {
    if (!file) { return }
    if (file.name.split(".").pop().toLowerCase() != 'json') {
      message.warning('仅支持导入json文件', 1)
      return
    }
    const reader = new FileReader()
    reader.onload = function fileReadCompleted() {
      const json = JSON.parse(reader.result)
      const info = {}
      pageConfigs.forEach(it => info['key-' + it.id] = it)
      json.pageConfigs.forEach(it => info['key-' + it.id] = it)
      const newConfigs = Object.keys(info).map(key => info[key])
      setPageConfigs(newConfigs)
      updatePageConfigStorage(newConfigs)
    }
    reader.readAsText(file)
  }
  
  const exportConfig = async function () {
    const data = JSON.stringify({
      pageConfigs: pageConfigs
    }, undefined, 4)

    const blob = new Blob([data], { type: "text/json" })
    const url = await fileUtils.getBase64ByBlob(blob)
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: 'download',
        data: {
          url,
          name: 'web-page-helper 插件配置.json'
        }
      })
    })
  }

  return (
    <div className="App">
      {
        view === 'config-list' &&
        <ConfigList
          list={ currentPageConfigs }
          onClose={ closeConfig }
          onOpen={ openConfig }
          onRun={ runConfig }
          onEdit={ editConfig }
          onAdd={ addConfig }
          onImport={ importConfig }
          onExport={ exportConfig }
        />
      }
      {
        view === 'config-detail' &&
        <ConfigDetail
          config={ currentConfig }
          hostname={ hostname }
          pageUrl={ pageUrl }
          onSave={ saveConfig }
          onCancel={ cancelEdit }
          onRemove={ removeConfig }
        />
      }
    </div>
  )
}

export default App