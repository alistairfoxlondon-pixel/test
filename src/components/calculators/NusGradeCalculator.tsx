import { useState, useEffect } from 'preact/hooks';
import { updateUrlParams, getUrlParam, SharedActions } from '../../utils/calculatorHelpers';

export default function NusGradeCalculator() {
  const [currentCap, setCurrentCap] = useState<number>(0);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [targetCap, setTargetCap] = useState<number>(4.0);
  const [remainingCredits, setRemainingCredits] = useState<number>(20);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = getUrlParam('data');
      if (data) {
        const parsed = JSON.parse(decodeURIComponent(data));
        setCurrentCap(parsed.currentCap || 0);
        setCurrentCredits(parsed.currentCredits || 0);
        setTargetCap(parsed.targetCap || 4.0);
        setRemainingCredits(parsed.remainingCredits || 20);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const data = JSON.stringify({ currentCap, currentCredits, targetCap, remainingCredits });
    updateUrlParams({ data: encodeURIComponent(data) });
  }, [currentCap, currentCredits, targetCap, remainingCredits, isLoaded]);

  const calculateRequiredAverage = () => {
    if (currentCredits === 0 && remainingCredits === 0) return { avg: 0, possible: false, message: "Enter credits to calculate." };
    
    const totalTargetPoints = targetCap * (currentCredits + remainingCredits);
    const currentPoints = currentCap * currentCredits;
    const requiredPoints = totalTargetPoints - currentPoints;
    
    if (remainingCredits <= 0) return { avg: 0, possible: false, message: "Remaining credits must be greater than 0." };
    
    const requiredAvg = requiredPoints / remainingCredits;
    
    if (requiredAvg > 5.0) {
      return { avg: requiredAvg.toFixed(2), possible: false, message: "Mathematically impossible (requires > 5.0 average)." };
    }
    
    if (requiredAvg < 0) {
      return { avg: 0, possible: true, message: "Target already achieved even with 0.0 average." };
    }
    
    return { avg: requiredAvg.toFixed(2), possible: true, message: "Achievable." };
  };

  const { avg, possible, message } = calculateRequiredAverage();

  const summaryText = `NUS Target Grade Calculator:
Current CAP: ${currentCap} (over ${currentCredits} MCs)
Target CAP: ${targetCap}
Remaining MCs: ${remainingCredits}
Required Average Grade Point: ${avg}
Status: ${possible ? 'Achievable' : 'Not possible'}
Calculated via SG Calc (https://sgcalc.example.com)`;

  if (!isLoaded) return <div class="p-8 text-center text-slate-500">Loading calculator...</div>;

  return (
    <div class="p-4 sm:p-6">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current CAP</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="5"
              class="input-field" 
              value={currentCap || ''} 
              onInput={(e) => setCurrentCap(parseFloat(e.currentTarget.value) || 0)}
              placeholder="e.g. 3.8"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Total Graded MCs</label>
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

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target CAP</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="5"
              class="input-field" 
              value={targetCap || ''} 
              onInput={(e) => setTargetCap(parseFloat(e.currentTarget.value) || 0)}
              placeholder="e.g. 4.0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remaining Graded MCs to Take</label>
            <input 
              type="number" 
              min="0"
              class="input-field" 
              value={remainingCredits || ''} 
              onInput={(e) => setRemainingCredits(parseInt(e.currentTarget.value) || 0)}
              placeholder="e.g. 20"
            />
          </div>
        </div>
      </div>

      <div class={`border rounded-xl p-5 text-center ${possible ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
        <h2 class={`text-sm font-semibold uppercase tracking-wider mb-2 ${possible ? 'text-teal-800 dark:text-teal-300' : 'text-red-800 dark:text-red-300'}`}>
          Required Average Grade
        </h2>
        <div class={`text-4xl sm:text-5xl font-extrabold mb-2 ${possible ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
          {avg}
        </div>
        <div class={`text-sm font-medium ${possible ? 'text-teal-700 dark:text-teal-300' : 'text-red-700 dark:text-red-300'}`}>
          {message}
        </div>
        
        {possible && Number(avg) > 0 && (
          <div class="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-teal-200/50 dark:border-teal-800/50 pt-4">
            You need to average approximately a <strong>
              {Number(avg) > 4.5 ? 'A+' : Number(avg) > 4.0 ? 'A-' : Number(avg) > 3.5 ? 'B+' : Number(avg) > 3.0 ? 'B' : Number(avg) > 2.5 ? 'B-' : 'C+'}
            </strong> grade for your remaining modules.
          </div>
        )}
      </div>

      <SharedActions summaryText={summaryText} />

    </div>
  );
}
