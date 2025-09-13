import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  console.log('Modal isOpen:', isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Rendering modal content');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827',
                margin: 0 
              }}>
                {title}
              </h3>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ padding: '0.5rem' }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
