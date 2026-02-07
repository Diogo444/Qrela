function setExpanded(toggleButton, panel, isOpen) {
  toggleButton.setAttribute('aria-expanded', String(isOpen))
  toggleButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu')
  panel.dataset.open = isOpen ? 'true' : 'false'
  panel.setAttribute('aria-hidden', String(!isOpen))

  if (isOpen) {
    panel.removeAttribute('inert')
  } else {
    panel.setAttribute('inert', '')
  }
}

export function initNav(root = document) {
  const toggleButton = root.querySelector('[data-mobile-nav-toggle]')
  const panel = root.querySelector('[data-mobile-nav-panel]')
  if (!toggleButton || !panel) return

  setExpanded(toggleButton, panel, false)

  toggleButton.addEventListener('click', () => {
    const isOpen = panel.dataset.open === 'true'
    setExpanded(toggleButton, panel, !isOpen)
  })

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]')
    if (!link) return
    setExpanded(toggleButton, panel, false)
  })

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (panel.dataset.open !== 'true') return
    setExpanded(toggleButton, panel, false)
  })

  root.addEventListener('click', (event) => {
    if (panel.dataset.open !== 'true') return
    const target = event.target
    if (!(target instanceof Node)) return
    if (toggleButton.contains(target) || panel.contains(target)) return
    setExpanded(toggleButton, panel, false)
  })
}

