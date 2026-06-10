const calculateMatchScore = (job, profile, resume) => {
  let score = 0;
  
  const skillsWeight = 40;
  const keywordsWeight = 40;
  const educationWeight = 10;
  const experienceWeight = 10;

  // 1. Skills Match (40%)
  if (job.requiredSkills && job.requiredSkills.length > 0 && profile && profile.skills) {
    const jobSkills = job.requiredSkills.map(s => s.toLowerCase().trim());
    const studentSkills = profile.skills.map(s => s.toLowerCase().trim());
    
    let matchedSkills = 0;
    jobSkills.forEach(skill => {
      if (studentSkills.includes(skill)) {
        matchedSkills++;
      }
    });
    
    const skillScore = (matchedSkills / jobSkills.length) * skillsWeight;
    score += skillScore;
  } else {
    // Distribute base weight if skills absent
    score += (skillsWeight * 0.5);
  }

  // 2. Keyword Match in Resume (40%)
  if (resume && resume.extractedText && job.description) {
    const jobDescTokens = job.description.toLowerCase().match(/\b(\w+)\b/g) || [];
    const stopWords = new Set(['and', 'or', 'the', 'is', 'in', 'to', 'a', 'for', 'with', 'on', 'of', 'this', 'we', 'are', 'you']);
    const meaningfulTokens = [...new Set(jobDescTokens.filter(t => !stopWords.has(t) && t.length > 3))];

    const resumeText = resume.extractedText.toLowerCase();
    let keywordHits = 0;

    meaningfulTokens.forEach(token => {
      if (resumeText.includes(token)) {
        keywordHits++;
      }
    });

    const targetKeywords = Math.min(20, meaningfulTokens.length);
    let kwScore = 0;
    if (targetKeywords > 0) {
      kwScore = Math.min(1, keywordHits / targetKeywords) * keywordsWeight;
    } else {
      kwScore = keywordsWeight * 0.5;
    }
    score += kwScore;
  } else {
    score += (keywordsWeight * 0.3); // Baseline
  }

  // 3. Education Match (10%)
  if (profile && profile.degree && job.eligibility) {
    const degreeStr = profile.degree.toLowerCase();
    const eligStr = job.eligibility.toLowerCase();
    if (eligStr.includes(degreeStr) || degreeStr.includes(eligStr)) {
      score += educationWeight;
    } else {
      score += (educationWeight * 0.5);
    }
  } else {
    score += (educationWeight * 0.8);
  }

  // 4. Experience Match (10%)
  if (profile && profile.experience && job.description) {
    const expWords = profile.experience.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hasOverlap = expWords.some(w => job.description.toLowerCase().includes(w));
    if (hasOverlap) {
      score += experienceWeight;
    } else {
      score += (experienceWeight * 0.5);
    }
  } else {
    score += (experienceWeight * 0.8);
  }

  return Math.min(100, Math.round(score));
};

module.exports = { calculateMatchScore };
