import type { SearchOption } from "../types/api";
import styles from "./SearchBar.module.css";

type SearchBarProps = {
  value: string;
  options: SearchOption[];
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
};

function SearchBar({ value, options, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <input
        className={styles.search}
        type="search"
        list="atlas-options"
        value={value}
        placeholder="Search designers, source worlds or concepts..."
        onFocus={(event) => {
          event.currentTarget.select();
        }}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;

          onChange(nextValue);

          const exactMatch = options.some(
            (option) =>
              option.label.toLowerCase() === nextValue.trim().toLowerCase(),
          );

          if (exactMatch) {
            onSubmit(nextValue);
          }
        }}
      />

      <datalist id="atlas-options">
        {options.map((option) => (
          <option
            key={option.id}
            value={option.label}
            label={
              option.kind === "HOUSE"
                ? "Designer"
                : option.kind === "SOURCE"
                  ? "Source world"
                  : "Concept"
            }
          />
        ))}
      </datalist>
    </form>
  );
}

export default SearchBar;
