import SearchBar from './SearchBar'
import ApiStatus from './ApiStatus'
import styles from './Header.module.css'

function Header() {
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

      <SearchBar />
    </header>
  )
}

export default Header