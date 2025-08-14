import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';

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

interface ContactContextType {
  contacts: Contact[];
  searchResults: Contact[];
  addContact: (
    contact: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>
  ) => Promise<void>;
  searchContacts: (filters: SearchFilters) => void;
  unlockContact: (contactId: string) => void;
  resetSearch: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(
  undefined
);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({
  children
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);

  // Fetch contacts from backend on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch('/profiles'); // changed here
        if (!res.ok) throw new Error('Failed to fetch contacts');
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, []);

  // Add new contact to backend + update state
  const addContact = async (
    contactData: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>
  ) => {
    try {
      const res = await fetch('http://localhost:5000/profiles', {  // changed here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      if (!res.ok) throw new Error('Failed to save contact');
      const savedContact = await res.json();
      setContacts(prev => [...prev, savedContact]);
    } catch (err) {
      console.error(err);
      alert('Could not save contact to the server');
    }
  };

  // Search logic
  const searchContacts = (filters: SearchFilters) => {
    let results = [...contacts];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        contact =>
          contact.name.toLowerCase().includes(query) ||
          contact.jobTitle.toLowerCase().includes(query) ||
          contact.company.toLowerCase().includes(query) ||
          contact.skills.some(skill =>
            skill.toLowerCase().includes(query)
          )
      );
    }

    if (filters.jobTitle) {
      results = results.filter(contact =>
        contact.jobTitle
          .toLowerCase()
          .includes(filters.jobTitle!.toLowerCase())
      );
    }

    if (filters.company) {
      results = results.filter(contact =>
        contact.company
          .toLowerCase()
          .includes(filters.company!.toLowerCase())
      );
    }

    if (filters.location) {
      results = results.filter(contact =>
        contact.location
          .toLowerCase()
          .includes(filters.location!.toLowerCase())
      );
    }

    if (filters.industry) {
      results = results.filter(
        contact =>
          contact.industry.toLowerCase() ===
          filters.industry!.toLowerCase()
      );
    }

    if (filters.seniorityLevel) {
      results = results.filter(
        contact => contact.seniorityLevel === filters.seniorityLevel
      );
    }

    if (filters.companySize) {
      results = results.filter(
        contact => contact.companySize === filters.companySize
      );
    }

    if (filters.experience) {
      results = results.filter(
        contact =>
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

  // Unlock contact locally
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
    resetSearch
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};
