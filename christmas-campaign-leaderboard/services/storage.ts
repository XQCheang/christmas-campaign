import { Recruiter, Applicant } from '../types';

const STORAGE_KEY = 'talentquest_campaign_dec_v1';

// The specific list of recruiters for the campaign
const TEAM_ROSTER = [
  'Alice Chen',
  'Bob Smith',
  'Charlie Davis',
  'Diana Prince',
  'Evan Wright',
  'Fiona Gallagher',
  'George Miller',
  'Hannah Lee',
  'Ivan Petrov',
  'Jessica Wu'
];

// Helper to generate fake data within the campaign period (Dec 1 - Dec 21)
const generateCampaignData = (name: string, id: string): Recruiter => {
  const apps: Applicant[] = [];
  // Random score for bots/initial state
  const count = Math.floor(Math.random() * 40) + 5; 
  
  const currentYear = new Date().getFullYear();
  const start = new Date(currentYear, 11, 1).getTime(); // Dec 1 (Month is 0-indexed, 11 is Dec)
  const end = new Date(currentYear, 11, 21).getTime();   // Dec 21

  for (let i = 0; i < count; i++) {
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);
    apps.push({
      id: `app-${id}-${i}`,
      email: `candidate${i}@example.com`,
      name: `Candidate ${i}`,
      appliedDate: date.toISOString(),
      source: 'LinkedIn'
    });
  }

  return {
    id,
    name,
    company: 'Talent Team',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Using DiceBear for consistent avatars
    applicants: apps,
    isBot: false // Treat everyone as a real user potnetially
  };
};

export const getStoredData = (): Recruiter[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with the roster if empty
  const initial = TEAM_ROSTER.map((name, idx) => 
    generateCampaignData(name, `recruiter-${idx}`)
  );
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
};

export const saveRecruiter = (recruiter: Recruiter): Recruiter[] => {
  const current = getStoredData();
  const existingIndex = current.findIndex(r => r.id === recruiter.id);
  
  if (existingIndex >= 0) {
    current[existingIndex] = recruiter;
  } else {
    current.push(recruiter);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
};

// Simplified login - just returns the user from the roster
export const loginUser = (id: string): Recruiter | null => {
  const all = getStoredData();
  return all.find(r => r.id === id) || null;
};

export const addNewRecruiter = (name: string): Recruiter => {
  const all = getStoredData();
  const id = `recruiter-${Date.now()}`; // Unique ID based on timestamp
  
  const newRecruiter: Recruiter = {
    id,
    name,
    company: 'Talent Team',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    applicants: [],
    isBot: false
  };

  all.push(newRecruiter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newRecruiter;
};

export const updateRecruiterName = (id: string, newName: string): boolean => {
  const all = getStoredData();
  const index = all.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  all[index].name = newName;
  // Update avatar to match new name for consistency
  all[index].avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return true;
};

const createApplicants = (count: number, startCount: number, dateStr?: string): Applicant[] => {
    // Create date at noon local time to avoid timezone boundary issues
    let dateObj = new Date();
    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      // Construct date using local time
      dateObj = new Date(y, m - 1, d, 12, 0, 0);
    }

    const newApps: Applicant[] = [];
    for (let i = 0; i < count; i++) {
      newApps.push({
        id: `sql-sync-${Date.now()}-${i}`,
        email: `mandarin.candidate.${Date.now()}.${i}@portal-sync.com`,
        name: `Mandarin Candidate ${startCount + i + 1}`,
        appliedDate: dateObj.toISOString(),
        source: 'Portal Sync (Mandarin)'
      });
    }
    return newApps;
};

// Directly adds X applicants to the selected date. Supports negative numbers to remove.
export const addManualApplicants = (recruiterId: string, countToAdd: number, targetDateStr: string): Recruiter | null => {
    if (countToAdd === 0) return null;
    
    const all = getStoredData();
    const index = all.findIndex(r => r.id === recruiterId);
    if (index === -1) return null;

    const recruiter = all[index];

    if (countToAdd > 0) {
        // Add applicants
        const newApps = createApplicants(countToAdd, recruiter.applicants.length, targetDateStr);
        recruiter.applicants = [...recruiter.applicants, ...newApps];
    } else {
        // Remove applicants (Deduct)
        const removeCount = Math.abs(countToAdd);
        if (removeCount >= recruiter.applicants.length) {
            recruiter.applicants = [];
        } else {
            // Remove from the end (LIFO - Last In First Out)
            recruiter.applicants = recruiter.applicants.slice(0, recruiter.applicants.length - removeCount);
        }
    }
    
    all[index] = recruiter;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return recruiter;
};

// Syncs the absolute count. 
export const syncApplicantCount = (recruiterId: string, totalCount: number, targetDateStr?: string): Recruiter | null => {
  const all = getStoredData();
  const index = all.findIndex(r => r.id === recruiterId);
  if (index === -1) return null;

  const recruiter = all[index];
  const currentCount = recruiter.applicants.length;
  const diff = totalCount - currentCount;

  if (diff === 0) return recruiter;

  if (diff > 0) {
    const newApps = createApplicants(diff, currentCount, targetDateStr);
    recruiter.applicants = [...recruiter.applicants, ...newApps];
  } else {
    // If new count is lower (data correction), trim from the end (undo most recent additions)
    // Only do this if strictly needed, usually we discourage lowering scores
    recruiter.applicants = recruiter.applicants.slice(0, totalCount);
  }

  all[index] = recruiter;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return recruiter;
};