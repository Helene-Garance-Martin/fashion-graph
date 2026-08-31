import type { SearchOption } from '../types/api'
import styles from './SearchBar.module.css'

type SearchBarProps = {
  value: string
  options: SearchOption[]
  onChange: (value: string) => void
  onSubmit: () => void
}

function SearchBar({
  value,
  options,
  onChange,
  onSubmit,
}: SearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <input
        className={styles.search}
        type="search"
        list="atlas-options"
        value={value}
        placeholder="Search designers or source worlds..."
        onChange={(event) => onChange(event.target.value)}
      />

      <datalist id="atlas-options">
        {options.map((option) => (
          <option
            key={option.id}
            value={option.label}
            label={
              option.kind === 'HOUSE'
                ? 'Designer'
                : 'Source world'
            }
          />
        ))}
      </datalist>
    </form>
  )
}

export default SearchBar