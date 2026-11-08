/**
 * Local demo knowledge base for the AI Assistant.
 * Replace `services/assistant.ts` with a real LLM call when a backend exists.
 */
export const SUGGESTED_QUESTIONS = [
  'How can I donate blood?',
  'How often can I donate blood?',
  'Which blood type is universal donor?',
  'Who can receive O+ blood?',
  'How do I create a blood request?',
  'What should I eat before donating?',
];

export const ASSISTANT_GREETING =
  "Hi! I'm the LifeLink AI Assistant 🩺\n\nI can help you with questions about blood donation, how to use the app, and general health information. How can I help you today?";

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['how often', 'interval', 'again', 'every', 'gap', 'frequency'],
    answer:
      'Whole blood can be donated every 56–90 days (LifeLink uses 90 days to be safe). This gives your body time to replenish red cells. Platelet donations can be made more frequently — up to 24 times per year.',
  },
  {
    keywords: ['universal', 'any type', 'anyone'],
    answer:
      'O- (O negative) is the universal red cell donor — it can be given to anyone regardless of blood type. However, O- is also one of the rarest types. AB+ is the universal plasma donor and universal red cell recipient. Every blood type is precious and needed!',
  },
  {
    keywords: ['o+', 'o positive', 'receive'],
    answer:
      'O+ (O positive) blood can be donated to anyone with a positive blood type: A+, B+, AB+ and O+. This covers about 85% of the population, making O+ donors very valuable! O+ patients can receive from O+ and O- donors.',
  },
  {
    keywords: ['create', 'post', 'request', 'emergency'],
    answer:
      'To create a blood request, tap the red drop button in the bottom bar, then the "+" button (or use "Post Emergency Request" on Home). Fill in the patient name, blood group, units, urgency and hospital details. Nearby donors with a matching blood group will be notified instantly.',
  },
  {
    keywords: ['eat', 'food', 'meal', 'diet', 'before'],
    answer:
      'Eat a healthy meal 3–4 hours before donation — avoid fatty foods. Drink plenty of water (at least 500 ml extra). Avoid alcohol for 24 hours before donating. Good foods: fruits, vegetables, lean proteins and whole grains. Iron-rich foods like spinach, lentils and red meat help too.',
  },
  {
    keywords: ['after', 'recover', 'rest'],
    answer:
      'After donating: rest for 10–15 minutes, have a snack and juice, drink extra fluids for 24–48 hours, avoid heavy lifting and intense exercise for the rest of the day, and keep the bandage on for a few hours.',
  },
  {
    keywords: ['eligible', 'eligibility', 'age', 'weight', 'can i donate', 'who can'],
    answer:
      'You can usually donate if you are 17–65 years old, weigh at least 50 kg, are in good health, and your hemoglobin is at least 12.5 g/dL. You should not donate if you have a fever, recently had a tattoo (within 6 months), or are on certain medications.',
  },
  {
    keywords: ['how can i donate', 'donate blood', 'how to donate', 'process', 'donate'],
    answer:
      'To donate blood, you need to be at least 17 years old, weigh at least 50 kg and be in good health. Visit a partner hospital or blood bank, or accept an active blood request in LifeLink. The donation itself takes about 10–15 minutes, and the full visit around 45 minutes.',
  },
  {
    keywords: ['hospital', 'blood bank', 'inventory', 'stock'],
    answer:
      'Open the Hospitals tab to see partner hospitals with live blood inventory. Green means good stock, amber means low and red means critically low — those are the groups that need donors most urgently.',
  },
  {
    keywords: ['available', 'status', 'resting', 'busy'],
    answer:
      'You can set your availability from your Profile: Available (shown to requesters), Resting (recently donated) or Busy (temporarily unavailable). You can also flip the "Available to Donate" switch on the Home screen.',
  },
];

export const FALLBACK_ANSWER =
  "That's a great question! For the most accurate information about blood donation, please consult a healthcare professional or visit your local blood bank. I can help with eligibility, donation frequency, blood type compatibility, preparation tips and using the LifeLink app.";
