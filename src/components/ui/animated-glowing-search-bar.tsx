import { Search, SlidersHorizontal } from 'lucide-react';
import './animated-glowing-search-bar.css';

export default function SearchComponent() {
  return (
    <div className="nav-search">
      <div className="nav-search__shell">
        <div className="nav-search__field">
          <Search size={16} className="nav-search__icon" />
          <input
            type="text"
            placeholder="Search careers, skills..."
            className="nav-search__input"
            aria-label="Search careers and skills"
          />
          <button type="button" className="nav-search__filter" aria-label="Open filters">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
