import { useEffect, useState } from 'react';
import { InvoiceFormData } from '@/components/InvoiceForm';

const STORAGE_KEY = 'invoice-form-draft';

export const useInvoicePersist = () => {
  const saveDraft = (data: InvoiceFormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save draft to localStorage:', e);
    }
  };

  const restoreDraft = (): Partial<InvoiceFormData> | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to restore draft from localStorage:', e);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear draft from localStorage:', e);
    }
  };

  return { saveDraft, restoreDraft, clearDraft };
};
