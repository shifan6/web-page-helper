import './App.css'
import React, { useState } from 'react'
import ConfigList from './components/ConfigList'
import ConfigDetail from './components/ConfigDetail'
import ConfigManage from './components/ConfigManage'
import fileUtils from './utils/file'
import { message, Modal } from 'antd'

function App({ configs, location, isDeveloper }) {
  const pageUrl = location && (location.host + location.pathname).replace('www.', '')
  const hostname = location && location.hostname.replace('www.', '')
  const [ pageConfigs, setPageConfigs ] = useState(configs || [])
  const [ view, setView ] = useState('config-list')
  const [ currentConfig, setCurrentConfig ] = useState({})
  const [ mode, setMode ] = useState(isDeveloper ? 'developer' : 'user')
  const [ newConfigIds, setNewConfigIds ] = useState([])
  const [ isShowModal, setIsShowModal ] = useState(false)
  const currentPageConfigs = pageConfigs.filter(config => {
    const { apply = 'site', page } = config
    return page === 'common' || (apply === 'site' && page === hostname) || (apply === 'url' && page === pageUrl)
  })

  const sendMessageToContent = function (message, config, applyAll = true) {
    const { id, content, page, site } = config
    const queryInfo = applyAll ? {} : { currentWindow: true, active: true }
    chrome.tabs.query(queryInfo, (tabs) => {
      [...tabs].forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          message: message,
          data: {
            id,
            content,
            page,
            site
          }
        })
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

  const removeConfig = function (id, back = true) {
    const newConfigs = JSON.parse(JSON.stringify(pageConfigs))
    const index = newConfigs.findIndex(it => it.id === id)

    // 如果配置正在应用中，则取消应用该配置
    const config = newConfigs[index]
    if (config.auto) {
      config.auto = false
      updateContentByConfig(config)
    }

    // 删除并更新配置
    newConfigs.splice(index, 1)
    back && setView('config-list')
    setPageConfigs(newConfigs)
    updatePageConfigStorage(newConfigs)
  }

  // 合并原有配置和新导入的配置, 新增配置 auto 为 false
  const mergeConfigs = function (add = {}, origin = {}, override = true ) {
    const newIds = []
    const newConfigs = Object.keys(add).reduce((result, key) => {
      const current = add[key]
      const { id, page, type, content } = current
      const originInfo = origin[id]
      if (!originInfo) {
        result.push({
          ...current,
          auto: false
        })     
        newIds.push(id)
      } else if (override && (page !== originInfo.page || type !== originInfo.type || content !== originInfo.content)) {
        result.push({
          ...current,
          auto: false,
        })
        newIds.push(id)
        delete origin[id]
      }
      return result
    }, []).concat([...Object.values(origin)])

    // 更新配置、缓存（不用更新视图，因为新增的配置均是默认关闭）
    setPageConfigs(newConfigs)
    updatePageConfigStorage(newConfigs)

    // 跳转到管理配置页，并区分区分新增/原有配置
    setView('config-manage')
    setNewConfigIds(newIds)

    // 如果配置没有变化，给出提示
    if (newIds.length === 0) {
      message.warning('无新增配置', 1)
    } else {
      message.success('导入成功', 1)
    }
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

      // 判断是否存在冲突，冲突定义：相同id的配置，配置的页面、类型和内容不一致
      const hasConflict = Object.keys(add).some(key => {
        const current = add[key]
        const { id, page, type, content } = current
        const originInfo = origin[id]
        if (!originInfo) { return false }
        return page !== originInfo.page || type !== originInfo.type || content !== originInfo.content
      })

      if (hasConflict) {
        setIsShowModal(true)
        Modal.confirm({
          title: '',
          centered: true,
          content: '检测到配置冲突，您要用新导入的配置覆盖原有配置吗？',
          okText: '跳过',
          okType: 'link',
          cancelText: '覆盖原有配置',
          cancelButtonProps: {
            type: 'link',
            danger: true
          },
          icon: null,
          onOk() {
            setIsShowModal(false)
            mergeConfigs(add, origin, false)
          },
          onCancel() {
            setIsShowModal(false)
            mergeConfigs(add, origin, true)
          },
        })
      } else {
        mergeConfigs(add, origin, false)
      }
    }
    reader.readAsText(file)
  }
  
  const exportConfig = async function ( configs = pageConfigs ) {
    const data = JSON.stringify({
      pageConfigs: configs
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

  const ManageConfig = function () {
    setView('config-manage')
    setNewConfigIds([])
  }

  const saveMode = function(val = 'user') {
    setMode(val)
    chrome.storage.sync.set({ 'developerMode': val === 'developer' })
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
    <div 
      className="App"
      style={ isShowModal ? { minHeight: '185px' } : {} }
    >
      {
        view === 'config-list' &&
        <ConfigList
          mode= { mode }
          list={ currentPageConfigs }
          onClose={ closeConfig }
          onOpen={ openConfig }
          onRun={ runConfig }
          onEdit={ editConfig }
          onAdd={ addConfig }
          onManage={ ManageConfig }
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
          onCancel={ () => {setView('config-list')} }
          onRemove={ removeConfig }
        />
      }
      {
        view === 'config-manage' &&
        <ConfigManage
          mode={ mode }
          newIds={ newConfigIds }
          list={ pageConfigs }
          onBack={ () => { setView('config-list') } }
          onClose={ closeConfig }
          onOpen={ openConfig }
          onRemove={ removeConfig }
          onExport={ exportConfig }
          onModeChange={ saveMode }
        />
      }
    </div>
  )
}

export default App