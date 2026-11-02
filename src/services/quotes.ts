import { Quote } from '../types';

export const LANGUAGE_QUOTES: Quote[] = [
  {
    quote: "To have another language is to possess a second soul.",
    author: "Charlemagne",
    languageContext: "Latin / European languages"
  },
  {
    quote: "One language sets you in a corridor for life. Two languages open every door along the way.",
    author: "Frank Smith",
    languageContext: "Psycholinguist"
  },
  {
    quote: "The limits of my language mean the limits of my world.",
    author: "Ludwig Wittgenstein",
    languageContext: "Austrian philosopher"
  },
  {
    quote: "A different language is a different vision of life.",
    author: "Federico Fellini",
    languageContext: "Italian filmmaker"
  },
  {
    quote: "You can never understand one language until you understand at least two.",
    author: "Geoffrey Willans",
    languageContext: "Author"
  },
  {
    quote: "Language is the road map of a culture. It tells you where its people come from and where they are going.",
    author: "Rita Mae Brown",
    languageContext: "American novelist"
  },
  {
    quote: "With languages, you are at home anywhere.",
    author: "Edmund de Waal",
    languageContext: "Ceramicist & author"
  },
  {
    quote: "Learning another language is not only learning different words for the same things, but learning another way to think about things.",
    author: "Flora Lewis",
    languageContext: "Journalist"
  },
  {
    quote: "Do you know what a foreign accent is? It's a sign of bravery.",
    author: "Amy Chua",
    languageContext: "Author"
  },
  {
    quote: "Change your language and you change your thoughts.",
    author: "Karl Albrecht",
    languageContext: "Cognitive theorist"
  }
];

export function getDailyQuote(dateString?: string): Quote {
  const date = dateString ? new Date(dateString) : new Date();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = Math.abs(dayOfYear) % LANGUAGE_QUOTES.length;
  return LANGUAGE_QUOTES[index];
}
