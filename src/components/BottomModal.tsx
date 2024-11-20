import React from "react";
import ReactDOM from "react-dom";

interface BottomModalProps {
  isOpen: boolean;
  title: string;
  width?: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  title,
  width = "100%",
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, width }}>
        <div style={styles.header}>
          <div>{title}</div>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px 8px 0 0",
    overflow: "hidden",
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    height: "80vh",
  },
  header: {
    padding: "16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  body: {
    padding: "16px",
    overflowY: "auto" as const,
    maxHeight: "calc(80vh - 52px)"
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
};

export default BottomModal;
