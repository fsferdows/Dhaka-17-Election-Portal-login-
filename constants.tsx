
import { Candidate, VotingCenter, NewsItem } from './types';

export const CONSTITUENCY_DETAILS = {
  id: '190',
  name: 'Dhaka-17',
  area: 'Gulshan, Banani, Baridhara, Dhaka Cantonment',
  totalVoters: 425310,
  wards: ['15', '18', '19'],
  pollingStations: 124
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    userId: 'u_01711223344',
    name: 'Mohammad Rahim',
    phone: '+880 1711-223344',
    email: 'm.rahim.al@election.gov.bd',
    party: 'Bangladesh Awami League',
    symbol: 'Boat (Nouka)',
    manifesto: 'Leading Dhaka-17 into the Smart Bangladesh era with world-class infrastructure.',
    manifestoDetails: {
      infrastructure: 'Completing the Gulshan-Banani elevated expressway links.',
      education: 'Transforming local schools into Smart Classrooms with AI tools.',
      healthcare: 'Mobile medical units for the Cantonment periphery zones.',
      digitalization: '100% paperless ward services via the DH-17 App.'
    },
    focusIssues: ['Smart City', 'Security', 'Connectivity'],
    imageUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&q=80&w=400',
    isApproved: true,
    stats: { followers: 18500, rsvps: 1200, positiveSentiment: 82, budgetTransparency: 95 },
    events: [
      {
        id: 'e1',
        candidateId: 'c1',
        title: 'Smart City Town Hall',
        description: 'Open floor discussion on high-tech surveillance in Gulshan.',
        date: '2024-12-10T15:00:00',
        location: 'Gulshan Club'
      }
    ]
  },
  {
    id: 'c2',
    userId: 'u_01822334455',
    name: 'Dr. Farhana Karim',
    phone: '+880 1822-334455',
    email: 'dr.farhana.bnp@election.gov.bd',
    party: 'Bangladesh Nationalist Party',
    symbol: 'Sheaf of Paddy (Dhaner Shish)',
    manifesto: 'Restoring democracy and prioritizing eco-urbanism in the heart of Dhaka.',
    manifestoDetails: {
      infrastructure: 'Eco-reconstruction of the Banani lake drainage system.',
      education: 'Youth empowerment grants for entrepreneurs in DH-17.',
      healthcare: 'Subsidized health insurance for lower-income residents.',
      digitalization: 'Blockchain-based local governance tracking.'
    },
    focusIssues: ['Democracy', 'Eco-Planning', 'Healthcare'],
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    isApproved: true,
    stats: { followers: 16200, rsvps: 980, positiveSentiment: 79, budgetTransparency: 88 },
    events: []
  }
];

export const VOTING_CENTERS: VotingCenter[] = [
  { id: 'vc1', name: 'Gulshan Model High School', location: 'Gulshan 2', ward: '18', capacity: '5,000', status: 'Normal' },
  { id: 'vc2', name: 'Banani Vidya Niketan', location: 'Banani Road 13', ward: '19', capacity: '3,800', status: 'Busy' },
  { id: 'vc3', name: 'Baridhara High School', location: 'Baridhara J-Block', ward: '18', capacity: '4,200', status: 'Normal' },
  { id: 'vc4', name: 'Cantonment Board School', location: 'Cantonment Area', ward: '15', capacity: '8,000', status: 'Crowded' }
];

export const NEWS_FEED: NewsItem[] = [
  { id: 'n1', title: 'Official: Security deployments finalized for Gulshan-Banani sectors.', source: 'EC Bangladesh', time: '1h ago', isUrgent: true },
  { id: 'n2', title: 'Voter Information Slips distribution begins via DH-17 Digital Portal.', source: 'Admin', time: '4h ago', isUrgent: false },
  { id: 'n3', title: 'Guidelines for International Observers published for Constituency 190.', source: 'EC Bangladesh', time: '12h ago', isUrgent: false }
];
