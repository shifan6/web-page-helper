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
    return page === 'common' || (apply === 'site' && page === hostname) || (apply === 'url' && page === pageUrl)
  })

  const sendMessageToContent = function (message, config, applyAll = true) {
    const { id, content } = config
    const queryInfo = applyAll ? {} : { currentWindow: true, active: true }
    chrome.tabs.query(queryInfo, (tabs) => {
      [...tabs].forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { message: message, data: { id, content } })
      })
    })
  }

  const updatePageConfigStorage = function (newConfigs) {
    chrome.storage.sync.set({ 'pageConfigs': newConfigs })
  }

  const closeConfig = function (config) {
    config.auto = false
    setPageConfigs([...pageConfigs])
    updatePageConfigStorage(pageConfigs)
    updateContentByConfig(config)
  }

  const openConfig = function (config) {
    config.auto = true
    setPageConfigs([... pageConfigs])
    updatePageConfigStorage(pageConfigs)
    updateContentByConfig(config)
  }
  
  const runConfig = function (config) {
    sendMessageToContent('addScript', config, false)
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
      config.id = getUniqueId()
      newConfigs.push(config)
    }
    setView('config-list')
    setPageConfigs(newConfigs)
    updatePageConfigStorage(newConfigs)
    updateContentByConfig(config)
  }
  
  const updateContentByConfig = function (config) {
    const { auto, type } = config
    const name = `${ type }-${ auto ? 'add' : 'remove' }`
    switch (name) {
      case 'style-add':
        sendMessageToContent('addStyle', config)
        break
      case 'script-add':
        sendMessageToContent('addScript', config)
        break
      case 'style-remove':
        sendMessageToContent('removeStyle', config)
        break
      case 'script-remove':
        sendMessageToContent('removeScript', config)
        break
    }
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
      const json = JSON.parse(reader.result) || {}
      json.pageConfigs = json.pageConfigs || []

      // 过滤原有的不合法数据
      const origin = pageConfigs.reduce((result, current) => {
        const { id, page, type, content } = current
        if (id && page && type && content) {
          result[id] = current
        }
        return result
      }, {})

      // 过滤导入的不合法数据
      const add = json.pageConfigs.reduce((result, current) => {
        const { id, page, type, content } = current
        if (id && page && type && content) {
          result[id] = current
        }
        return result
      }, {})

      // 新增配置 auto 为 false
      const newConfigs = Object.keys(add).reduce((result, key) => {
        const current = add[key]
        const { id, page, type, content } = current
        const originInfo = origin[id]
        if (originInfo) {
          // 处理相同id的配置：配置详情一致时过滤，不一致时新增（不对比name、auto）
          if (page !== originInfo.page || type !== originInfo.type || content !== originInfo.content) {
            result.push({
              ...current,
              auto: false,
              id: getUniqueId()
            })
          }
        } else {
          result.push({
            ...current,
            auto: false
          })
        }
        return result
      }, [...Object.values(origin)])

      // 更新配置、缓存（不用更新视图，因为新增的配置均是默认关闭）
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

  const getUniqueId = function () {
    const len = 6
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const maxPos = chars.length
    const timestamp = new Date().getTime()
    let result = ''
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    result += timestamp
    return result
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