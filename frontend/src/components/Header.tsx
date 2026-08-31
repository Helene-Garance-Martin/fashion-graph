import SearchBar from './SearchBar'
import ApiStatus from './ApiStatus'
import type { SearchOption } from '../types/api'
import styles from './Header.module.css'

type HeaderProps = {
  searchValue: string
  searchOptions: SearchOption[]
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
}

function Header({
  searchValue,
  searchOptions,
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
        options={searchOptions}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
      />
    </header>
  )
}

export default Header