import React from "react"
import ReactDOM from "react-dom"

/**
 * @desc 普通弹框
 * @author 程华军
 */
interface ModalProps {
  isOpen: boolean
  title: string
  width?: string
  zIndex?: number
  onClose: () => void
  onCancel: () => void
  onConfirm: () => void
  children: React.ReactNode
}
const BASE_ZINDEX = 2147483647

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  zIndex,
  width = "500px",
  onClose,
  onCancel,
  onConfirm,
  children
}) => {
  if (!isOpen) return null
  const styles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: BASE_ZINDEX + Math.max(1, zIndex ?? 0)
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      display: "flex",
      flexDirection: "column",
      maxHeight: "80vh"
    },
    header: {
      padding: "16px",
      borderBottom: "1px solid #eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "16px",
      cursor: "pointer"
    },
    body: {
      padding: "16px",
      overflowY: "auto" as const,
      maxHeight: "500px"
    },
    footer: {
      padding: "16px",
      borderTop: "1px solid #eee",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px"
    }
  }
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
        <div style={styles.footer}>
          <button onClick={onCancel}>取消</button>
          <button onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
