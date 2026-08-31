import SearchBar from './SearchBar'
import ApiStatus from './ApiStatus'
import type { ApiHouse } from '../types/api'
import styles from './Header.module.css'

type HeaderProps = {
  searchValue: string
  houses: ApiHouse[]
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}

function Header({
  searchValue,
  houses,
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>
          Twining the Codex
        </h1>

        <p className={styles.subtitle}>
          An inspiration atlas · live from the collection
        </p>

        <ApiStatus />
      </div>

      <SearchBar
        value={searchValue}
        houses={houses}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
      />
    </header>
  )
}

export default Header