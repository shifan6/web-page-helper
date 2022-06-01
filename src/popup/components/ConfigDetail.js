import './ConfigDetail.css'
import React, { useState } from 'react'

const ConfigDetail = function ({ config, hostname, pageUrl, onSave, onCancel, onRemove }) {
  const [ info, setInfo ] = useState(config)
  const handleValueChange = function (value, prop) {
    switch (prop) {
      case 'apply':
        setInfo({
          ...info,
          [prop]: value,
          page: value === 'common' ? 'common' : value === 'site' ? hostname : pageUrl
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
          maxLength="10"
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
        <span className="label">适用页面</span>
        <label>
          <input
            type="radio"
            checked={ info.page === 'common'}
            onChange={ (e) => { handleValueChange('common', 'apply') }}
          />
          所有网站
        </label>
        <label>
          <input
            type="radio"
            checked={ info.apply === 'site' }
            onChange={ (e) => { handleValueChange('site', 'apply') }}
          />
          当前网站
        </label>
        <label>
          <input
            type="radio"
            checked={ info.apply === 'url' }
            onChange={ (e) => { handleValueChange('url', 'apply') }}
          />
          当前网址
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