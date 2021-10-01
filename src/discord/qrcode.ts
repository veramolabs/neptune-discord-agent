import { IIdentifier, IDIDManager, TAgent, TKeyType } from '@veramo/core'
import { Request, Router } from 'express'
import Canvas from 'canvas'
import QRCode from '@propps/qrcode'

export const QrCodeRouter = (): Router => {
  const router = Router()

  router.get('/:code', async (req: Request, res) => {
    if (req.params.code) {
      console.log(req.params.code)
      
      const dataUrl = await QRCode.toDataURL(req.params.code)
      const qrCodeImage = await Canvas.loadImage(dataUrl)
  
      const canvas = Canvas.createCanvas(500, 500)
      const context = canvas.getContext('2d')
      context.drawImage(qrCodeImage, 0, 0, canvas.width, canvas.height)
      
      res.
        contentType('image/png').
        send(canvas.toBuffer())

    }else {
      res.send('No code')
    }
  })

  return router
}
