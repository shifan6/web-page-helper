(async function() {
  let pageConfigs
  const hostname = location && location.hostname.replace('www.', '')
  const pageUrl = location && (location.host + location.pathname).replace('www.', '')
  const addStyle = function(it) {
    const { id, content } = it
    removeStyle(id)  // 先清除已注入的样式
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
    removeScript(id)  // 先清除已注入的脚本
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
        pageConfigs = storage && storage.pageConfigs || []
        resolve()
      })
    })
  }

  const initPage = function() {
    pageConfigs.forEach(config => {
      const { page, auto, type, apply = 'site' } = config
      if (!auto) { return }
      if (!(page === 'common' || (apply === 'site' && hostname === page) || (apply === 'url' && pageUrl === page))) { return }
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