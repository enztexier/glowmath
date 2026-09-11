import { useState } from 'react'
import type { ReactNode } from 'react'

interface AccordionItemProps {
  title: string
  status: string
  children: ReactNode
  defaultOpen?: boolean
}

export default function AccordionItem({ title, status, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="acc-item">
      <button type="button" className="acc-head" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <span>{title}</span>
        <span className="status">
          {status} {open ? '⌄' : '›'}
        </span>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  )
}
