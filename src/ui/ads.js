// coller ici le code AdSense plus tard
export class AdSlot {
  constructor({ label = 'Publicité' } = {}) {
    this.label = label
  }

  mount(container) {
    if (!container) return

    container.innerHTML = `
      <div class="rounded-xl border border-border bg-surface-1/40 p-3 md:p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-wide text-muted">${this.label}</p>
          <p class="text-xs text-muted">Aide à financer le site</p>
        </div>
        <div class="mt-3 grid place-items-center rounded-lg border border-dashed border-border bg-bg/30 px-3 py-6 text-center">
          <p class="text-sm text-muted">Espace publicitaire</p>
          <p class="mt-1 text-xs text-muted">Merci de soutenir Qrela.</p>
        </div>
      </div>
    `
  }
}

export function initAds() {
  new AdSlot({ label: 'Publicité' }).mount(document.getElementById('ad-slot-top'))
  new AdSlot({ label: 'Publicité' }).mount(document.getElementById('ad-slot-left'))
  new AdSlot({ label: 'Publicité' }).mount(document.getElementById('ad-slot-bottom'))
}
