import SearchBar from './SearchBar'

function Header() {
  return (
    <header>
      <div>
        <h1>Twining the Codex</h1>
        <p>An inspiration atlas · live from the collection</p>
      </div>

      <SearchBar />
    </header>
  )
}

export default Header