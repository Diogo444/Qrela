import './style.css'
import { initNav } from './ui/nav.js'
import { initTooltips } from './ui/tooltips.js'

window.addEventListener('DOMContentLoaded', async () => {
  initNav(document)
  initTooltips(document)

  const hasGenerator = Boolean(document.getElementById('qr-mount') && document.getElementById('payload-url'))
  if (!hasGenerator) return

  const { initGenerator } = await import('./ui/bindings.js')
  initGenerator()
})
