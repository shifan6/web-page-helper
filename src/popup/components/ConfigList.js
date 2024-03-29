import './ConfigList.css'
import React from 'react'
import { Button, Switch, Upload } from 'antd'
import { EditOutlined, PlayCircleOutlined } from '@ant-design/icons'

const ConfigList = function ({ mode, list, onClose, onOpen, onRun, onEdit, onAdd, onManage, onImport }) {
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
    <div className="config-list" data-component="config-list">
      {
        list.map(config => {
          return (
            <div
              className="list-item"
              key={ config.id }
            >
              <span className="main">
                <span className="name">{ config.name }</span>
                <span className="tag type">{ config.type === 'style' ? 'Style' : 'Script' }</span>
                { config.page === 'common' && <span className="tag">通用</span> }
              </span>
              {
                config.type === 'script' &&
                <Button
                  type="link"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={ (e) => { e.preventDefault(); onRun(config) }}
                />
              }
              {
                mode === 'developer' && 
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined/>}
                  onClick={ (e) => { e.preventDefault(); onEdit(config) }}
                />
              } 
              <Switch
                size="small"
                defaultChecked={ config.auto }
                onChange={ (checked, e) => { handleAutoChange(checked, e, config) }}
              />
            </div>
          )
        })
      }
      {
        !list.length &&
        <div className="config-empty">
          暂无数据
        </div>
      }
      <div className="config-buttons">
        <div className="left">
          <Upload
            showUploadList={ false }
            beforeUpload={ (file) => { onImport(file); return false  }}
            accept=".json"
          >
            <Button
              type="link"
              size="small"
            >
              导入
            </Button>
          </Upload>
        </div>
        <div className="right">
          {
            mode === 'developer' && 
            <Button
              type="link"
              size="small"
              onClick={ (e) => { e.preventDefault(); onAdd() }}
            >
              新增配置
            </Button>
          }
          {
            list.length > 0 &&
            <Button
              type="link"
              size="small"
              onClick={ (e) => { e.preventDefault(); onManage() }}
            >
              管理配置
            </Button>
          }
        </div>
      </div>
    </div>
  )
}

export default ConfigList