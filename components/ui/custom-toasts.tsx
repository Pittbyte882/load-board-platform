import { toast } from 'sonner'
import Image from 'next/image'

interface ToastWithLogoProps {
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export function showToastWithLogo({ title, message, type = 'info' }: ToastWithLogoProps) {
  const toastContent = (
    <div className="flex items-center gap-3">
      <Image
        src="/images/boxaloo-logo.png"
        alt="Boxaloo"
        width={120}
        height={40}
        className="h-10 w-auto"
      />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )

  switch (type) {
    case 'success':
      return toast.success(toastContent)
    case 'error':
      return toast.error(toastContent)
    default:
      return toast.info(toastContent)
  }
}

export function showConfirmWithLogo(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  return toast.custom((t) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <Image
          src="/images/boxaloo-logo.png"
          alt="Boxaloo"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            onCancel?.()
            toast.dismiss(t)
          }}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm()
            toast.dismiss(t)
          }}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
  })
}