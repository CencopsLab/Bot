import type { ServiceLink } from '@/types';

export const SERVICE_LINKS: ServiceLink[] = [
  {
    id: 'cybercrime',
    title: 'National Cyber Crime Reporting Portal',
    description: 'Report cybercrime and access the official complaint portal.',
    url: 'https://cybercrime.gov.in',
    icon: 'alert-circle-outline',
  },
  {
    id: 'tafcop',
    title: 'Sanchar Saathi · TAFCOP',
    description: 'Review mobile connections issued in your name.',
    url: 'https://tafcop.sancharsaathi.gov.in',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'ceir',
    title: 'Sanchar Saathi · CEIR',
    description: 'Request blocking of a lost or stolen handset.',
    url: 'https://ceir.sancharsaathi.gov.in',
    icon: 'lock-closed-outline',
  },
];
