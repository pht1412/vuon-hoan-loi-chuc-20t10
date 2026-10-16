export interface FlowerItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'rose' | 'lotus' | 'sunflower' | 'tulip' | 'clover';
  message: string;
  color: string;
}

export interface JournalItem {
  id: string;
  order: number;
  title: string;
  content: string;
}

export interface AppreciationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  tag: string;
}

export interface FinalLetterData {
  title: string;
  date: string;
  paragraphs: string[];
  signature: string;
}

export interface PrivateJourneyData {
  welcome: {
    greeting: string;
    subtitle: string;
    message: string;
    invitation: string;
  };
  flowers: FlowerItem[];
  easterEggFlower: FlowerItem;
  journal: JournalItem[];
  psNote: {
    title: string;
    content: string;
  };
  appreciations: AppreciationItem[];
  finalLetter: FinalLetterData;
}
