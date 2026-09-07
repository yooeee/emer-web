import { ReactNode, useEffect, useRef } from "react";
import Icon from "./Icon";

interface DialogProps {
  labelId: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Dialog({
  labelId,
  onClose,
  children,
  className = "",
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`dialog ${className}`}
      aria-labelledby={labelId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="icon-button dialog-close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
          autoFocus
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
