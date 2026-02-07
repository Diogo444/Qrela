function setOpen(tooltip, isOpen) {
  tooltip.dataset.open = isOpen ? 'true' : 'false'

  const button = tooltip.querySelector('[data-tooltip-toggle]')
  if (button) button.setAttribute('aria-expanded', String(isOpen))
}

function closeAll(root) {
  root.querySelectorAll('[data-tooltip][data-open="true"]').forEach((tooltip) => setOpen(tooltip, false))
}

export function initTooltips(root = document) {
  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const toggle = target.closest('[data-tooltip-toggle]')
    if (toggle) {
      const tooltip = toggle.closest('[data-tooltip]')
      if (!tooltip) return

      const isOpen = tooltip.dataset.open === 'true'
      closeAll(root)
      setOpen(tooltip, !isOpen)
      return
    }

    const clickedInsideTooltip = Boolean(target.closest('[data-tooltip]'))
    if (!clickedInsideTooltip) closeAll(root)
  })

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeAll(root)
  })
}

