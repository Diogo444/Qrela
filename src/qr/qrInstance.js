import QRCodeStyling from 'qr-code-styling'
import { getPayloadResult } from './qrPayload.js'
import { buildQrOptions } from './qrUpdate.js'

export function createQrInstance(state) {
  const payloadResult = getPayloadResult(state)
  const data = payloadResult.ok ? payloadResult.data : state.runtime.lastValidPayload

  return new QRCodeStyling({
    type: 'svg',
    ...buildQrOptions(state, data),
  })
}

