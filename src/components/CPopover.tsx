import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const Popover: React.FC<PopoverProps> = ({ content, children, open, onClose, position = 'bottom' }) => {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const style: React.CSSProperties = {
        position: 'absolute',
      };

      switch (position) {
        case 'top':
          style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          style.top = `${rect.top + window.scrollY}px`;
          style.transform = 'translate(-50%, -100%)';
          break;
        case 'right':
          style.left = `${rect.right + window.scrollX}px`;
          style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
          style.transform = 'translate(0, -50%)';
          break;
        case 'bottom':
          style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
          style.top = `${rect.bottom + window.scrollY}px`;
          style.transform = 'translate(-50%, 0)';
          break;
        case 'left':
          style.left = `${rect.left + window.scrollX}px`;
          style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
          style.transform = 'translate(-100%, -50%)';
          break;
        default:
          break;
      }

      setPopoverStyle(style);
    }
  }, [open, position]);

  const popoverContent = (
    <div
      style={{
        ...popoverStyle,
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 2147483648,
      }}
    >
      {content}
    </div>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={triggerRef}>
      <div onClick={onClose} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      {open && ReactDOM.createPortal(popoverContent, document.body)}
    </div>
  );
};


export default Popover;
