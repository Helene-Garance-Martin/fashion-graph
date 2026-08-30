import styles from './SearchBar.module.css'

function SearchBar() {
  return (
    <input
      className={styles.search}
      type="search"
      placeholder="Search designers, sources, objects..."
    />
  )
}

export default SearchBar