import { useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { streamService } from '../../services/StreamService'
import { Computer } from '../../lib/stores/computers-store'

interface StreamModalProps {
  computer: Computer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StreamModal({ computer, open, onOpenChange }: StreamModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (open && computer) {
      // Stream başlat
      streamService.startStream({
        computerId: computer.id,
        onStream: (stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        },
        onError: (error) => {
          console.error('Stream error:', error)
          onOpenChange(false)
        },
        onClose: () => {
          onOpenChange(false)
        }
      })
    } else {
      // Stream durdur
      streamService.stopStream()
    }
  }, [open, computer])

  if (!computer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Streaming: {computer.name}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
