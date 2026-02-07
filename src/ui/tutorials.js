export function initTutorials(root = document) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-help-toggle]')
    if (!button) return

    const panelId = button.getAttribute('data-help-toggle')
    const panel = panelId ? root.getElementById(panelId) : null
    if (!panel) return

    const nextHidden = !panel.hidden
    panel.hidden = nextHidden
    button.setAttribute('aria-expanded', String(!nextHidden))
  })
}

