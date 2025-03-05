
import { createContext, useContext } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const ToastContext = createContext<{
  toast: (props: ToastProps) => void
}>({
  toast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function toast(props: ToastProps) {
  console.log("Toast:", props)

  alert(`${props.title}: ${props.description}`)
}
