import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { useAuth } from './AuthContext'; // Import to get current user

export interface Contact {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  industry: string;
  experience: number;
  seniorityLevel: string;
  companySize?: string;
  skills: string[];
  education: string;
  workExperience?: string; // New field for detailed work experience
  email?: string;
  phone?: string;
  avatar: string;
  isUnlocked: boolean; // This is now per-user
  uploadedBy: string;
  uploadedAt: Date;
  verified?: boolean;
  hasContactInfo?: boolean;
  extraLinks?: string[];
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
  verified?: boolean;
  hasContactInfo?: boolean;
}

interface ContactContextType {
  contacts: Contact[];
  searchResults: Contact[];
  loading: boolean;
  error: string | null;
  addContact: (
    contact: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>
  ) => Promise<void>;
  searchContacts: (filters: SearchFilters) => void;
  unlockContact: (contactId: string) => void;
  resetSearch: () => void;
  refreshContacts: () => Promise<void>; // New function to refresh contacts
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
  const { user } = useAuth(); // Get current user
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts from backend with user-specific unlock status
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching contacts from backend...');
      
      // Build URL with userId if available
      const url = user?.id 
        ? `https://contactpro-backend.vercel.app/profiles?userId=${user.id}`
        : 'https://contactpro-backend.vercel.app/profiles';
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch contacts: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Transform the data to match our Contact interface
      const transformedContacts = data.map((profile: any) => ({
        id: profile.id || profile._id,
        name: profile.name || '',
        jobTitle: profile.jobTitle || '',
        company: profile.company || '',
        location: profile.location || '',
        industry: profile.industry || '',
        experience: profile.experience || 0,
        seniorityLevel: profile.seniorityLevel || '',
        companySize: profile.companySize || '',
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        education: profile.education || '',
        workExperience: profile.workExperience || '', // Include work experience
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar || '',
        isUnlocked: profile.isUnlocked || false, // Per-user unlock status
        uploadedBy: profile.uploadedBy || '',
        uploadedAt: profile.uploadedAt ? new Date(profile.uploadedAt) : new Date(),
        verified: profile.verified || false,
        hasContactInfo: !!(profile.email || profile.phone)
      }));
      
      console.log('Contacts loaded successfully:', transformedContacts.length);
      console.log('User-specific unlock status applied for user:', user?.id);
      setContacts(transformedContacts);
      setSearchResults([]); // Reset search results when contacts are loaded
      
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts when component mounts or user changes
  useEffect(() => {
    fetchContacts();
  }, [user?.id]); // Re-fetch when user changes

  // Enhanced search logic
  const searchContacts = (filters: SearchFilters) => {
    let results = [...contacts];

    // Text-based search (now includes work experience)
    if (filters.query?.trim()) {
      const query = filters.query.toLowerCase().trim();
      results = results.filter(
        contact =>
          contact.name.toLowerCase().includes(query) ||
          contact.jobTitle.toLowerCase().includes(query) ||
          contact.company.toLowerCase().includes(query) ||
          contact.location.toLowerCase().includes(query) ||
          contact.industry.toLowerCase().includes(query) ||
          (contact.workExperience && contact.workExperience.toLowerCase().includes(query)) ||
          contact.skills.some(skill =>
            skill.toLowerCase().includes(query)
          )
      );
    }

    // Job title filter
    if (filters.jobTitle?.trim()) {
      results = results.filter(contact =>
        contact.jobTitle
          .toLowerCase()
          .includes(filters.jobTitle!.toLowerCase().trim())
      );
    }

    // Company filter
    if (filters.company?.trim()) {
      results = results.filter(contact =>
        contact.company
          .toLowerCase()
          .includes(filters.company!.toLowerCase().trim())
      );
    }

    // Location filter
    if (filters.location?.trim()) {
      results = results.filter(contact =>
        contact.location
          .toLowerCase()
          .includes(filters.location!.toLowerCase().trim())
      );
    }

    // Industry filter
    if (filters.industry) {
      results = results.filter(
        contact =>
          contact.industry.toLowerCase() ===
          filters.industry!.toLowerCase()
      );
    }

    // Seniority level filter
    if (filters.seniorityLevel) {
      results = results.filter(
        contact => contact.seniorityLevel === filters.seniorityLevel
      );
    }

    // Experience range filter
    if (filters.experience) {
      const { min = 0, max = 50 } = filters.experience;
      results = results.filter(
        contact =>
          contact.experience >= min &&
          contact.experience <= max
      );
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(contact =>
        filters.skills!.some(skill =>
          contact.skills.some(contactSkill =>
            contactSkill.toLowerCase().includes(skill.toLowerCase().trim())
          )
        )
      );
    }

    // Verified filter
    if (filters.verified !== undefined) {
      results = results.filter(contact => 
        contact.verified === filters.verified
      );
    }

    // Has contact info filter
    if (filters.hasContactInfo !== undefined) {
      results = results.filter(contact => 
        (contact.email || contact.phone) === filters.hasContactInfo
      );
    }

    setSearchResults(results);
  };

  // Add new contact to backend + update state
  const addContact = async (
    contactData: Omit<Contact, 'id' | 'uploadedAt' | 'isUnlocked'>
  ) => {
    try {
      const res = await fetch('https://contactpro-backend.vercel.app/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactData,
          uploadedBy: user?.id // Add current user as uploader
        })
      });
      if (!res.ok) throw new Error('Failed to save contact');
      const savedContact = await res.json();
      
      const transformedContact = {
        ...savedContact,
        id: savedContact.id || savedContact._id,
        uploadedAt: new Date(savedContact.uploadedAt),
        isUnlocked: false // New contacts are locked for everyone initially
      };
      
      setContacts(prev => [transformedContact, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Could not save contact to the server');
    }
  };

  // Unlock contact locally (after successful backend call)
  const unlockContact = (contactId: string) => {
    const updateContact = (contact: Contact) =>
      contact.id === contactId
        ? { ...contact, isUnlocked: true }
        : contact;

    setContacts(prev => prev.map(updateContact));
    setSearchResults(prev => prev.map(updateContact));
  };

  const resetSearch = () => {
    setSearchResults([]);
  };

  // New function to refresh contacts (useful after unlocking)
  const refreshContacts = async () => {
    await fetchContacts();
  };

  const value = {
    contacts,
    searchResults,
    loading,
    error,
    addContact,
    searchContacts,
    unlockContact,
    resetSearch,
    refreshContacts
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};