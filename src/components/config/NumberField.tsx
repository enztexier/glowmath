import { useEffect, useState } from 'react'
import type { ChangeEvent, FocusEvent } from 'react'

interface NumberFieldProps {
  value: number
  onCommit: (value: number) => void
  allowNegative?: boolean
  'aria-label'?: string
}

/**
 * A digits-only numeric input that stays freely editable: unlike a plain
 * `<input type="number">` bound straight to a number, it never snaps to 0
 * while the field is momentarily empty (e.g. while the user is clearing "100"
 * to type "40"). The committed value only updates once the text parses to a
 * real number; an incomplete edit reverts on blur.
 */
export default function NumberField({ value, onCommit, allowNegative = false, ...rest }: NumberFieldProps) {
  const [raw, setRaw] = useState(String(value))

  useEffect(() => {
    setRaw(String(value))
  }, [value])

  function sanitize(input: string): string {
    const cleaned = input.replace(allowNegative ? /[^0-9-]/g : /[^0-9]/g, '')
    if (!allowNegative) return cleaned
    const isNegative = cleaned.startsWith('-')
    const digits = cleaned.replace(/-/g, '')
    return isNegative ? `-${digits}` : digits
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const cleaned = sanitize(e.target.value)
    setRaw(cleaned)
    if (cleaned !== '' && cleaned !== '-' && Number.isFinite(Number(cleaned))) {
      onCommit(Number(cleaned))
    }
  }

  function handleBlur(_e: FocusEvent<HTMLInputElement>) {
    if (raw === '' || raw === '-' || !Number.isFinite(Number(raw))) {
      setRaw(String(value))
    }
  }

  return (
    <input type="text" inputMode={allowNegative ? 'text' : 'numeric'} value={raw} onChange={handleChange} onBlur={handleBlur} {...rest} />
  )
}
