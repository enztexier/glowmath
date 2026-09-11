import type { Operation } from '../../engine/types'
import { operationLabel } from '../../engine/configSummary'

interface OperationChipsProps {
  operations: Operation[]
  selected: Operation[]
  onToggle: (operation: Operation) => void
}

export default function OperationChips({ operations, selected, onToggle }: OperationChipsProps) {
  return (
    <div className="chips">
      {operations.map((operation) => (
        <button
          key={operation}
          type="button"
          className={`chip${selected.includes(operation) ? ' selected' : ''}`}
          aria-pressed={selected.includes(operation)}
          onClick={() => onToggle(operation)}
        >
          {operationLabel(operation)}
        </button>
      ))}
    </div>
  )
}
