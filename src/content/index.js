(async function() {
  let pageConfigs
  const defaultConfigs = [
    {
      id: 1,
      name: '隐藏侧边栏',
      page: 'douban.com',
      type: 'style',
      content: '.aside { display: none }',
      auto: false,  // 是否自动执行
    },
    {
      id: 2,
      name: '隐藏小组信息',
      page: 'douban.com',
      type: 'style',
      content: '#group-info, .group-board { display: none }',
      auto: false,
    },
    {
      id: 3,
      name: '隐藏Logo',
      page: 'douban.com',
      type: 'style',
      content: '.nav-logo { display: none } .nav-primary { padding-bottom: 20px!important; }',
      auto: false,
    },
    {
      id: 5,
      name: '隐藏推荐的视频',
      page: 'zhihu.com',
      type: 'style',
      content: '.VideoAnswerPlayer { display: none }',
      auto: false,  // 是否自动执行
    },
    {
      id: 6,
      name: '隐藏侧边栏',
      page: 'zhihu',
      type: 'style',
      content: '.GlobalSideBar { display: none }',
      auto: false,  // 是否自动执行
    },
    {
      id: 8,
      name: '去水印',
      page: 'gaoding.com',
      type: 'script',
      content: `
            // step 1: 去除无关元素、隐藏水印、扩大容器区域
            const app = document.querySelector('#app')
            const container = document.querySelector('.eui-base-container')
            const removeElements = []
            for(let i=0; i<container.children.length; i++) {
                const item = container.children[i]
                if (!item.classList.contains('eui-main-container')) {
                    removeElements.push(item)
                }
            }
            removeElements.forEach(item => {
                container.removeChild(item)
            })
            document.querySelector('.remove-watermark') && (document.querySelector('.remove-watermark').outerHTML = '')
            const style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = '.editor-watermark { z-index: -1!important } .editor-shell-wrap { padding: 0!important }'
            document.getElementsByTagName('head').item(0).appendChild(style)
            const main = document.querySelector('.eui-main-container')
            main.style.left = 0
            main.style.top = 0
            main.style.right = 0

            // step2: 调整比例（代码or鼠标or工具栏）
            document.querySelector('.eui-editor-tool-bar__zoom-button').click()

            // step3: 隐藏工具栏、调整结构，用于滚动截图
            setTimeout(() => {
                const toolbar = document.querySelector('.editor-bottom')
                toolbar.outerHTML = ''
                app.outerHTML = document.querySelector('.editor-shell-wrap').outerHTML
            })
        `,
      auto: false,  // 是否自动执行
    },
    {
      id: 7,
      name: '隐藏图片',
      page: 'common',
      type: 'style',
      content: 'img { display: none!important }',
      auto: false,  // 是否自动执行
    }
  ]
  const hostname = window.location.hostname
  const addStyle = function(it) {
    const { id, content } = it
    removeStyle(id)
    const head = document.querySelector('head')
    const style = document.createElement('style')
    style.type = 'text/css'
    style.id = 'helper-extension-style-' + id
    style.appendChild(document.createTextNode(content))
    head.appendChild(style)
  }

  const removeStyle = function(id) {
    const style = document.querySelector('#helper-extension-style-' + id)
    if (!style) { return }
    style.outerText = ''
  }

  const addScript = function(it) {
    const { id, content } = it
    removeScript(id)
    const head = document.querySelector('head')
    const script = document.createElement('script')
    script.textContent = '(function() {' + content + '})()'  // 每个脚本各自独立
    head.appendChild(script)
  }

  const removeScript = function(id) {
    const script = document.querySelector('#helper-extension-script-' + id)
    if (!script) { return }
    script.outerText = ''
  }

  const downloadFileByUrl = function ({ url, name }) {
    const a = document.createElement("a")
    document.body.appendChild(a)
    a.style.display = 'none'
    a.href = url
    a.download = name
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const setPageConfigs = function() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('pageConfigs', (storage) => {
        if (storage && storage.pageConfigs) {
          pageConfigs = storage && storage.pageConfigs
        } else {
          pageConfigs = defaultConfigs
          chrome.storage.sync.set({ 'pageConfigs': pageConfigs })
        }
        resolve()
      })
    })
  }

  const initPage = function() {
    pageConfigs.forEach(config => {
      const { page, auto, type } = config
      if (!hostname.includes(page) && page !== 'common') { return }
      if (!auto) { return }
      if (type === 'style') {
        addStyle(config)
      }
      if (type === 'script') {
        addScript(config)
      }
    })
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.message) {
      case 'location':
        sendResponse(location)
        break
      case 'addScript':
        addScript(request.data)
        break
      case 'removeScript':
        removeScript(request.data.id)
        break
      case 'addStyle':
        addStyle(request.data)
        break
      case 'removeStyle':
        removeStyle(request.data.id)
        break
      case 'download':
        downloadFileByUrl(request.data)
    }
  });

  await setPageConfigs()
  initPage()
})()