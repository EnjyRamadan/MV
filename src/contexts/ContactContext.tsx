import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Contact {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  industry: string;
  experience: number;
  seniorityLevel: string;
  companySize: string;
  skills: string[];
  education: string;
  email?: string;
  phone?: string;
  avatar: string;
  isUnlocked: boolean;
  uploadedBy: string;
  uploadedAt: Date;
}

interface ContactContextType {
  contacts: Contact[];
  searchResults: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>) => void;
  searchContacts: (filters: SearchFilters) => void;
  unlockContact: (contactId: string) => void;
  resetSearch: () => void;
}

export interface SearchFilters {
  query?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  industry?: string;
  seniorityLevel?: string;
  companySize?: string;
  skills?: string[];
  experience?: { min: number; max: number };
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    jobTitle: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    industry: 'Technology',
    experience: 7,
    seniorityLevel: 'Senior',
    companySize: '1000-5000',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    education: 'BS Computer Science, Stanford',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isUnlocked: false,
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Michael Chen',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY',
    industry: 'Financial Services',
    experience: 5,
    seniorityLevel: 'Mid-level',
    companySize: '100-500',
    skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL'],
    education: 'MBA, Wharton School',
    email: 'michael.chen@startupxyz.com',
    phone: '+1-555-0456',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isUnlocked: false,
    uploadedBy: 'user2',
    uploadedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    jobTitle: 'UX Designer',
    company: 'Design Studio',
    location: 'Austin, TX',
    industry: 'Design',
    experience: 4,
    seniorityLevel: 'Mid-level',
    companySize: '50-100',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    education: 'BFA Design, Art Institute',
    email: 'emily.rodriguez@designstudio.com',
    phone: '+1-555-0789',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isUnlocked: false,
    uploadedBy: 'user1',
    uploadedAt: new Date('2024-01-17')
  }
];

interface ContactProviderProps {
  children: ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);

  const addContact = (contactData: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      uploadedAt: new Date(),
      isUnlocked: false,
    };
    setContacts(prev => [...prev, newContact]);
  };

  const searchContacts = (filters: SearchFilters) => {
    let results = [...contacts];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.jobTitle.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    if (filters.jobTitle) {
      results = results.filter(contact =>
        contact.jobTitle.toLowerCase().includes(filters.jobTitle!.toLowerCase())
      );
    }

    if (filters.company) {
      results = results.filter(contact =>
        contact.company.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    if (filters.location) {
      results = results.filter(contact =>
        contact.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.industry) {
      results = results.filter(contact =>
        contact.industry.toLowerCase() === filters.industry!.toLowerCase()
      );
    }

    if (filters.seniorityLevel) {
      results = results.filter(contact =>
        contact.seniorityLevel === filters.seniorityLevel
      );
    }

    if (filters.companySize) {
      results = results.filter(contact =>
        contact.companySize === filters.companySize
      );
    }

    if (filters.experience) {
      results = results.filter(contact =>
        contact.experience >= filters.experience!.min &&
        contact.experience <= filters.experience!.max
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(contact =>
        filters.skills!.some(skill =>
          contact.skills.some(contactSkill =>
            contactSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setSearchResults(results);
  };

  const unlockContact = (contactId: string) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, isUnlocked: true }
          : contact
      )
    );
    setSearchResults(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, isUnlocked: true }
          : contact
      )
    );
  };

  const resetSearch = () => {
    setSearchResults([]);
  };

  const value = {
    contacts,
    searchResults,
    addContact,
    searchContacts,
    unlockContact,
    resetSearch,
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};