import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserData {
  timestamp: string;
  role: string;
  name: string;
  id: string;
  email: string;
  phone: string;
  verified_status: string;
  confidence: number;
  mismatched_fields: string;
}

export async function saveToCSV(data: UserData) {
  // Encrypt sensitive data
  const encryptedEmail = CryptoJS.AES.encrypt(
    data.email,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key'
  ).toString();
  const encryptedPhone = CryptoJS.AES.encrypt(
    data.phone,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key'
  ).toString();

  // Create CSV row
  const csvRow = [
    data.timestamp,
    data.role,
    data.name,
    data.id,
    encryptedEmail,
    encryptedPhone,
    data.verified_status,
    data.confidence,
    data.mismatched_fields,
  ].join(',');

  // Create blob and download
  const blob = new Blob([csvRow + '\n'], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'verified_users.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

