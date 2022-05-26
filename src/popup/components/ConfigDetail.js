import './ConfigDetail.css'
import React, { useState } from 'react'

const ConfigDetail = function ({ config, hostname, onSave, onCancel, onRemove }) {
  const [ info, setInfo ] = useState(config)
  const handleValueChange = function (value, prop) {
    switch (prop) {
      case 'common':
        setInfo({
          ...info,
          page: value ? 'common' : hostname
        })
        break
      default:
        setInfo({
          ...info,
          [prop]: value
        })
    }
  }

  return (
    <div className="config-detail">
      <div className="config-row">
        <span className="label">配置名称</span>
        <input
          className="name"
          type="text"
          maxLength="8"
          value={ info.name }
          onChange={ (e) => { handleValueChange(e.target.value, 'name') }}
        />
      </div>
      <div className="config-row">
        <span className="label">配置类型</span>
        <label>
          <input
            type="radio"
            checked={ info.type === 'style' }
            onChange={ (e) => { handleValueChange('style', 'type') }}
          />
          Style
        </label>
        <label>
          <input
            type="radio"
            checked={ info.type === 'script' }
            onChange={ (e) => { handleValueChange('script', 'type') }}
          />
          Script
        </label>
      </div>
      <div className="config-row">
        <span className="label">是否通用</span>
        <label>
          <input
            type="radio"
            checked={ info.page === 'common' }
            onChange={ (e) => { handleValueChange(true, 'common') }}
          />
          是
        </label>
        <label>
          <input
            type="radio"
            checked={ info.page !== 'common' }
            onChange={ (e) => { handleValueChange(false, 'common') }}
          />
          否
        </label>
      </div>
      <div className="config-row">
        <span className="label">默认开启</span>
        <label>
          <input
            type="radio"
            checked={ info.auto }
            onChange={ (e) => { handleValueChange(true, 'auto') }}
          />
          是
        </label>
        <label>
          <input
            type="radio"
            checked={ !info.auto }
            onChange={ (e) => { handleValueChange(false, 'auto') }}
          />
          否
        </label>
      </div>
      <div className="config-row">
        <span className="label">配置内容</span>
        <textarea
          className="content"
          value={ info.content }
          onChange={ (e) => { handleValueChange(e.target.value, 'content') }}
        />
      </div>
      <div className="config-buttons">
        <div className="left">
          {
            info.id &&
            <span
              className="remove"
              onClick={ (e) => { e.preventDefault(); onRemove(info.id) }}
            >
            删除
          </span>
          }
        </div>
        <div className="right">
          <span
            className="cancel"
            onClick={ (e) => { e.preventDefault(); onCancel() }}
          >
            返回
          </span>
          <span
            className="save"
            onClick={ (e) => { e.preventDefault(); onSave(info) }}
          >
            保存
          </span>
        </div>
      </div>
    </div>
  )
}

export default ConfigDetail