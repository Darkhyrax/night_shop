import React, { useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';

const DocumentTitleUpdater: React.FC = () => {
  const { company } = useCompany();

  useEffect(() => {
    // Actualizar título de la pestaña
    document.title = company.name;

    // Actualizar favicon
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) {
      if (company.useImage && company.logoData) {
        // Usar logo de empresa si está configurado
        link.href = company.logoData;
      } else {
        // Usar SVG por defecto de tienda
        link.href = '/store-icon.svg';
      }
    }
  }, [company.name, company.useImage, company.logoData]);

  return null;
};

export default DocumentTitleUpdater;
