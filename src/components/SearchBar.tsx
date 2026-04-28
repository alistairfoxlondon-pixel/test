import { useState } from 'preact/hooks';

// This would typically fetch from an API or a static JSON file
const allCalculators = [
  { title: "NUS CAP Calculator", path: "/nus-cap-calculator" },
  { title: "NTU CGPA Calculator", path: "/ntu-cgpa-calculator" },
  { title: "RP GPA Calculator", path: "/rp-gpa-calculator" },
  { title: "SMU GPA Calculator", path: "/smu-gpa-calculator" },
  { title: "SUSS GPA Calculator", path: "/suss-gpa-calculator" },
  { title: "SIT GPA Calculator", path: "/sit-gpa-calculator" },
  { title: "NYP GPA Calculator", path: "/nyp-gpa-calculator" },
  { title: "NUS GPA Calculator", path: "/nus-gpa-calculator" },
  { title: "NUS Grade Calculator", path: "/nus-grade-calculator" },
  { title: "NTU Grade Calculator", path: "/ntu-grade-calculator" },
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredResults = query.length > 0 
    ? allCalculators.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div class="relative w-full z-30">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          class="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-lg shadow-sm transition-colors"
          placeholder="Search for a calculator... (e.g. NUS CAP)"
          value={query}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.length > 0 && (
        <div class="absolute mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden max-h-60 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <ul class="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredResults.map(result => (
                <li>
                  <a href={result.path} class="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100">
                    {result.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div class="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
              No results found for "{query}". Try a different keyword.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
