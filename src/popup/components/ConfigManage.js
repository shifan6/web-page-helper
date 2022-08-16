import './ConfigManage.css'
import React from 'react'
import { Button, Switch, Divider, Breadcrumb } from 'antd'
import { HomeOutlined, DeleteOutlined, CloudDownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons'

const ConfigManage = function ({ mode, list, newIds, onBack, onClose, onOpen, onRemove, onExport, onModeChange }) {
	// 按页面分组
  const getGroupByPage = function (array) {
		const object = {}
		const commonConfigs = []
		array.forEach(it => {
			const { page } = it
			if (page === 'common') {
				commonConfigs.push(it)
				return
			}
			if (!object[page]) {
				object[page] = [it]
			} else {
				object[page].push(it)
			}
		})

		const pageNames = Object.keys(object).sort()
		const result = pageNames.reduce((result, current) => {
			result.push({
				page: current,
				configs: object[current],
			})
			return result
		}, [])
		if (commonConfigs.length) {
			result.unshift({
				page: 'common',
				configs: commonConfigs,
			})
		}
		return result
	}

	const newConfigs = getGroupByPage(list.filter(it => newIds.includes(it.id)))
	const oldConfigs = getGroupByPage(list.filter(it => !newIds.includes(it.id)))

  const handleAutoChange = function (checked, e, config) {
    e.preventDefault()
    switch (checked) {
      case true:
        onOpen(config)
        break
      case false:
        onClose(config)
    }
  }

	return (
		<div className="config-manage" data-component="config-manage">
			<div className="config-container">
        {
          newConfigs.length > 0 &&
          <div className="config-group new">
            <Divider>新增配置</Divider>
            {
              newConfigs.map(it => {
                return (
                  <div className="config-page" key={it.page}>
                    <Breadcrumb className="list-name">
                      <Breadcrumb.Item>
                        <HomeOutlined />
                        <span>{ it.page === 'common' ? '通用' : it.page }</span>
                      </Breadcrumb.Item>
                    </Breadcrumb>
                    {it.configs.map(config => {
                      return (
                        <div className="list-item" key={config.id}>
                          <span className="main">
                            <span className="name">{config.name}</span>
                            <span className="tag type">{config.type === 'style' ? 'Style' : 'Script'}</span>
                            {config.page === 'common' && <span className="tag">通用</span>}
                          </span>
                          <Button
                            className="remove"
                            type="link"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={e => {
                              e.preventDefault()
                              onRemove(config.id, false)
                            }}
                          />
                          <Button
                            type="link"
                            size="small"
                            icon={<CloudDownloadOutlined />}
                            onClick={e => {
                              e.preventDefault()
                              onExport([config])
                            }}
                          />
                          <Switch
                            size="small"
                            defaultChecked={config.auto}
                            onChange={(checked, e) => {
                              handleAutoChange(checked, e, config)
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })
            }
          </div>
        }
        {
          oldConfigs.length > 0 && 
          <div className="config-group old">
            {
              newConfigs.length > 0 &&
              <Divider>其他配置</Divider>
            }
            {
              oldConfigs.map(it => {
                return (
                  <div className="config-page" key={it.page}>
                    <Breadcrumb className="list-name">
                      <Breadcrumb.Item>
                        <HomeOutlined />
                        <span>{ it.page === 'common' ? '通用' : it.page }</span>
                      </Breadcrumb.Item>
                    </Breadcrumb>
                    {it.configs.map(config => {
                      return (
                        <div className="list-item" key={config.id}>
                          <span className="main">
                            <span className="name">{config.name}</span>
                            <span className="tag type">{config.type === 'style' ? 'Style' : 'Script'}</span>
                            {config.page === 'common' && <span className="tag">通用</span>}
                          </span>
                          <Button
                            className="remove"
                            type="link"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={e => {
                              e.preventDefault()
                              onRemove(config.id, false)
                            }}
                          />
                          <Button
                            type="link"
                            size="small"
                            icon={<CloudDownloadOutlined />}
                            onClick={e => {
                              e.preventDefault()
                              onExport([config])
                            }}
                          />
                          <Switch
                            size="small"
                            defaultChecked={config.auto}
                            onChange={(checked, e) => {
                              handleAutoChange(checked, e, config)
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })
            }
          </div>
        }
        {
          !newConfigs.length && 
          !oldConfigs.length && 
          <div className="config-empty">暂无数据</div>
        }
      </div>
      <div className="config-buttons">
        <div className="left">
          <Button
            className="cancel"
            type="link"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={e => {
              e.preventDefault()
              onBack()
            }}
          >
            返回
          </Button>
          <Button
            type="link"
            size="small"
            onClick={e => {
              e.preventDefault()
              onExport()
            }}
          >
            导出全部
          </Button>
        </div>
        <div className="right">
          <Switch  
            defaultChecked={ mode === 'developer' }
            checkedChildren="开发者模式"
            unCheckedChildren="用户模式"
            onChange={(checked) => {
              onModeChange(checked ? 'developer' : 'user')
            }}
          />
        </div>
      </div>
		</div>
	)
}

export default ConfigManage
