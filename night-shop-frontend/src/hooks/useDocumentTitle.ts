import { useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';

export const useDocumentTitle = () => {
  const { company } = useCompany();

  useEffect(() => {
    // Actualizar título de la pestaña
    document.title = company.name;

    // Actualizar favicon si hay logo
    if (company.useImage && company.logoData) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) {
        link.href = company.logoData;
      }
    }
  }, [company.name, company.useImage, company.logoData]);
};
