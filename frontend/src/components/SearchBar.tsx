import type { ApiHouse } from '../types/api'
import styles from './SearchBar.module.css'

type SearchBarProps = {
  value: string
  houses: ApiHouse[]
  onChange: (value: string) => void
  onSubmit: () => void
}

function SearchBar({
  value,
  houses,
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
        list="house-options"
        value={value}
        placeholder="Search designers..."
        onChange={(event) => onChange(event.target.value)}
      />

      <datalist id="house-options">
        {houses.map((house) => (
          <option
            key={house.id}
            value={house.label}
          />
        ))}
      </datalist>
    </form>
  )
}

export default SearchBar