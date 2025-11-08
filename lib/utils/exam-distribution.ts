export const SIMULATION_DISTRIBUTION = [
  { chapter: 1, count: 6, totalInDB: 80 },
  { chapter: 2, count: 2, totalInDB: 20 },
  { chapter: 3, count: 2, totalInDB: 20 },
  { chapter: 4, count: 1, totalInDB: 20 },
  { chapter: 5, count: 3, totalInDB: 20 },
  { chapter: 6, count: 3, totalInDB: 20 },
  { chapter: 7, count: 3, totalInDB: 30 },
  { chapter: 8, count: 2, totalInDB: 80 },
  { chapter: 9, count: 2, totalInDB: 20 },
  { chapter: 10, count: 2, totalInDB: 80 },
  { chapter: 11, count: 2, totalInDB: 80 },
  { chapter: 12, count: 1, totalInDB: 20 },
  { chapter: 13, count: 1, totalInDB: 10 },
]

export function getChapterName(chapterNumber: number): string {
  const chapters: Record<number, string> = {
    1: "מערכות הרכב הציבורי ותפקידן",
    2: "עמידת הנהג ותאי הנוסעים",
    3: "אמצעי הפעילה ובקרה",
    4: "היצע ברכב והשימוש הממולא בו",
    5: "תפעול מערכות הרכב",
    6: "הוראות בטיחות ואיכות הסביבה",
    7: "מערכות בטיחות חדישות",
    8: "נהיגה נכונה ונטייה בטוחה",
    9: "ציוד בטיחות ואמצעי חירום",
    10: "תחזוקה מונעת ובדיקה תקופתית",
    11: "תקלות טכניות",
    12: "מידע טכני ומפרטים",
    13: "עזרות משיטות",
  }
  return chapters[chapterNumber] || `פרק ${chapterNumber}`
}
