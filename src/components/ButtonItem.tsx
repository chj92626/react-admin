import React from "react"

interface ButtonProps {
  type?: "primary" | "default" | "dashed" | "text" | "link"
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  style: any
  children: React.ReactNode
}

export default function ({
  type = "default",
  loading = false,
  disabled = false,
  style,
  onClick,
  children
}:ButtonProps){
  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick()
    }
  }

  const buttonStyles = {
    primary: {
      backgroundColor: "#1890ff",
      color: "#fff",
      border: "none",
      ":hover": {
        backgroundColor: "#40a9ff"
      },
      ":disabled": {
        backgroundColor: "#d9d9d9",
        color: "#a0a0a0"
      }
    },
    default: {
      backgroundColor: "#FFFFFF",
      color: "#000",
      border: "1px solid #d9d9d9",
      ":hover": {
        borderColor: "#40a9ff"
      },
      ":disabled": {
        backgroundColor: "#f5f5f5",
        color: "#a0a0a0"
      }
    },
    dashed: {
      backgroundColor: "#fff",
      color: "#000",
      border: "1px dashed #d9d9d9",
      ":hover": {
        borderColor: "#40a9ff"
      },
      ":disabled": {
        backgroundColor: "#f5f5f5",
        color: "#a0a0a0"
      }
    },
    text: {
      backgroundColor: "transparent",
      color: "#1890ff",
      border: "none",
      ":hover": {
        color: "#40a9ff"
      },
      ":disabled": {
        color: "#a0a0a0"
      }
    },
    link: {
      backgroundColor: "transparent",
      color: "#1890ff",
      border: "none",
      textDecoration: "underline",
      ":hover": {
        color: "#40a9ff"
      },
      ":disabled": {
        color: "#a0a0a0"
      }
    }
  }

  const currentStyle = {
    ...buttonStyles[type],
    ...(disabled ? buttonStyles[type][":disabled"] : {})
  }

  return (
    <div
      style={{
        ...style,
        display:'inline-block',
        padding: "4px 6px",
        borderRadius: "8px",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        ...currentStyle,
        transition: "all 0.3s"
      }}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLButtonElement
        if (!disabled) {
          const hoverStyle = buttonStyles[type][":hover"]
          if (hoverStyle) {
            Object.assign(target.style, hoverStyle)
          }
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLButtonElement
        Object.assign(target.style, currentStyle)
      }}>
      {loading ? "Loading..." : children}
    </div>
  )
}
