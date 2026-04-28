import { useState, useEffect } from 'preact/hooks';
import { updateUrlParams, getUrlParam, SharedActions } from '../../utils/calculatorHelpers';

interface Module {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

// NTU uses a 5.0 system just like NUS
const GRADE_POINTS: Record<string, number> = {
  'A+': 5.0, 'A': 5.0, 'A-': 4.5,
  'B+': 4.0, 'B': 3.5, 'B-': 3.0,
  'C+': 2.5, 'C': 2.0, 'D+': 1.5,
  'D': 1.0, 'F': 0.0,
  'S': -1, 'U': -1 // Excluded from CGPA
};

export default function NtuCgpaCalculator() {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentCgpa, setCurrentCgpa] = useState<number>(0);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = getUrlParam('data');
      if (data) {
        const parsed = JSON.parse(decodeURIComponent(data));
        setModules(parsed.modules || [{ id: '1', name: 'Course 1', credits: 3, grade: 'A' }]);
        setCurrentCgpa(parsed.currentCgpa || 0);
        setCurrentCredits(parsed.currentCredits || 0);
      } else {
        setModules([
          { id: '1', name: 'Course 1', credits: 3, grade: 'A' },
          { id: '2', name: 'Course 2', credits: 3, grade: 'B+' },
          { id: '3', name: 'Course 3', credits: 4, grade: 'A-' },
        ]);
      }
    } catch (e) {
      console.error(e);
      setModules([{ id: '1', name: 'Course 1', credits: 3, grade: 'A' }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify({ modules, currentCgpa, currentCredits });
    updateUrlParams({ data: encodeURIComponent(data) });
  }, [modules, currentCgpa, currentCredits, isLoaded]);

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), name: `Course ${modules.length + 1}`, credits: 3, grade: 'A' }]);
  };

  const updateModule = (id: string, field: keyof Module, value: any) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const calculateTotals = () => {
    let totalPoints = currentCgpa * currentCredits;
    let totalGradedCredits = Number(currentCredits) || 0;
    let newSemesterPoints = 0;
    let newSemesterCredits = 0;

    modules.forEach(m => {
      const gradeVal = GRADE_POINTS[m.grade];
      if (gradeVal !== undefined && gradeVal >= 0) { 
        const credits = Number(m.credits) || 0;
        totalPoints += (gradeVal * credits);
        totalGradedCredits += credits;
        newSemesterPoints += (gradeVal * credits);
        newSemesterCredits += credits;
      }
    });

    const newCgpa = totalGradedCredits > 0 ? (totalPoints / totalGradedCredits) : 0;
    const semGpa = newSemesterCredits > 0 ? (newSemesterPoints / newSemesterCredits) : 0;

    return { 
      newCgpa: newCgpa.toFixed(2), 
      totalGradedCredits, 
      semGpa: semGpa.toFixed(2),
      newSemesterCredits
    };
  };

  const { newCgpa, totalGradedCredits, semGpa, newSemesterCredits } = calculateTotals();

  const getHonoursClass = (cgpa: number) => {
    if (cgpa >= 4.5) return "Highest Distinction"; // First Class
    if (cgpa >= 4.0) return "Distinction"; // Second Upper
    if (cgpa >= 3.5) return "Merit"; // Second Lower
    if (cgpa >= 3.0) return "Honours"; // Third Class
    if (cgpa >= 2.0) return "Pass";
    return "Fail";
  };

  const summaryText = `NTU CGPA Calculator Results:
Current CGPA: ${currentCgpa} (over ${currentCredits} AUs)
This Sem GPA: ${semGpa} (over ${newSemesterCredits} AUs)
New Cumulative CGPA: ${newCgpa}
Expected Class: ${getHonoursClass(Number(newCgpa))}
Calculated via SG Calc (https://sgcalc.example.com)`;

  if (!isLoaded) return <div class="p-8 text-center text-slate-500">Loading calculator...</div>;

  return (
    <div class="p-4 sm:p-6">
      
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Previous Semesters (Optional)</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current CGPA</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="5"
              class="input-field" 
              value={currentCgpa || ''} 
              onInput={(e) => setCurrentCgpa(parseFloat(e.currentTarget.value) || 0)}
              placeholder="e.g. 4.25"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Graded AUs</label>
            <input 
              type="number" 
              min="0"
              class="input-field" 
              value={currentCredits || ''} 
              onInput={(e) => setCurrentCredits(parseInt(e.currentTarget.value) || 0)}
              placeholder="e.g. 80"
            />
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">This Semester's Courses</h3>
        </div>

        <div class="hidden sm:grid grid-cols-12 gap-3 mb-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
          <div class="col-span-5">Course Name</div>
          <div class="col-span-3">Academic Units (AUs)</div>
          <div class="col-span-3">Expected Grade</div>
          <div class="col-span-1 text-right"></div>
        </div>

        <div class="space-y-3">
          {modules.map((mod, index) => (
            <div key={mod.id} class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white dark:bg-slate-800 p-3 sm:p-0 border border-slate-200 sm:border-transparent dark:border-slate-700 rounded-lg">
              
              <div class="col-span-1 sm:col-span-5">
                <label class="block sm:hidden text-xs text-slate-500 mb-1">Course Name</label>
                <input 
                  type="text" 
                  class="input-field" 
                  value={mod.name} 
                  onInput={(e) => updateModule(mod.id, 'name', e.currentTarget.value)}
                  placeholder={`Course ${index + 1}`}
                />
              </div>

              <div class="col-span-1 sm:col-span-3">
                <label class="block sm:hidden text-xs text-slate-500 mb-1">AUs</label>
                <input 
                  type="number" 
                  min="0"
                  class="input-field" 
                  value={mod.credits} 
                  onInput={(e) => updateModule(mod.id, 'credits', parseInt(e.currentTarget.value) || 0)}
                />
              </div>

              <div class="col-span-1 sm:col-span-3">
                <label class="block sm:hidden text-xs text-slate-500 mb-1">Expected Grade</label>
                <select 
                  class="input-field bg-white dark:bg-slate-800"
                  value={mod.grade}
                  onChange={(e) => updateModule(mod.id, 'grade', e.currentTarget.value)}
                >
                  <optgroup label="Graded">
                    {Object.keys(GRADE_POINTS).filter(k => GRADE_POINTS[k] >= 0).map(grade => (
                      <option value={grade}>{grade} ({GRADE_POINTS[grade]})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Ungraded (Excluded)">
                    <option value="S">S (Satisfactory)</option>
                    <option value="U">U (Unsatisfactory)</option>
                  </optgroup>
                </select>
              </div>

              <div class="col-span-1 text-right sm:text-center mt-2 sm:mt-0">
                <button 
                  onClick={() => removeModule(mod.id)}
                  class="text-red-500 hover:text-red-700 p-2 focus:outline-none"
                  aria-label="Remove module"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addModule}
          class="mt-4 flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-sm focus:outline-none"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add Another Course
        </button>
      </div>

      <div class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-5 text-center mt-8">
        <h2 class="text-sm font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-2">Your Expected CGPA</h2>
        <div class="text-4xl sm:text-5xl font-extrabold text-teal-600 dark:text-teal-400 mb-2">
          {newCgpa}
        </div>
        <div class="text-sm sm:text-base font-medium text-teal-700 dark:text-teal-300 mb-4">
          Degree Classification: {getHonoursClass(Number(newCgpa))}
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-teal-200/50 dark:border-teal-800/50 pt-4">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">This Sem GPA</div>
            <div class="text-xl font-bold text-slate-800 dark:text-slate-200">{semGpa}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Graded AUs</div>
            <div class="text-xl font-bold text-slate-800 dark:text-slate-200">{totalGradedCredits}</div>
          </div>
        </div>
      </div>

      <SharedActions summaryText={summaryText} />

    </div>
  );
}
