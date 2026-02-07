export function downloadPng(qrInstance, filename = 'qr-code') {
  qrInstance.download({ extension: 'png', name: filename })
}

export function downloadSvg(qrInstance, filename = 'qr-code') {
  qrInstance.download({ extension: 'svg', name: filename })
}

