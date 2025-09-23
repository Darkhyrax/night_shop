import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  isOpen: boolean;
  rootId?: string;
}

/**
 * Componente que maneja la accesibilidad para diálogos modales
 * Usa el atributo inert en lugar de aria-hidden para mejorar la accesibilidad
 */
const FocusTrap: React.FC<FocusTrapProps> = ({ children, isOpen, rootId = 'root' }) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento que tenía el foco antes de abrir el diálogo
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Aplicar el atributo inert al contenido principal
      const rootElement = document.getElementById(rootId);
      if (rootElement) {
        // Usar inert en lugar de aria-hidden
        rootElement.setAttribute('inert', '');
        
        // Eliminar aria-hidden si existe (para evitar conflictos)
        if (rootElement.hasAttribute('aria-hidden')) {
          rootElement.removeAttribute('aria-hidden');
        }
      }
    } else {
      // Restaurar el estado anterior al cerrar el diálogo
      const rootElement = document.getElementById(rootId);
      if (rootElement) {
        rootElement.removeAttribute('inert');
      }
      
      // Restaurar el foco al elemento anterior
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    
    return () => {
      // Limpieza al desmontar
      const rootElement = document.getElementById(rootId);
      if (rootElement) {
        rootElement.removeAttribute('inert');
      }
    };
  }, [isOpen, rootId]);

  return <>{children}</>;
};

export default FocusTrap;
