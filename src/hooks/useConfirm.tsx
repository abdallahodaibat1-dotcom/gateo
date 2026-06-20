'use client';

import { Modal, Button, Alert } from '@/components/ui';
import { useCallback, useState } from 'react';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleClose = useCallback(
    (value: boolean) => {
      setIsOpen(false);
      resolve?.(value);
      setResolve(null);
    },
    [resolve]
  );

  const ConfirmDialog = useCallback(() => {
    if (!options) return null;
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => handleClose(false)}
        title={options.title}
        description={options.description}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => handleClose(false)}>
              {options.cancelLabel || 'إلغاء'}
            </Button>
            <Button
              variant={options.variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => handleClose(true)}
            >
              {options.confirmLabel || 'تأكيد'}
            </Button>
          </div>
        }
      >
        {options.variant === 'danger' && (
          <Alert variant="error">لا يمكن التراجع عن هذا الإجراء بعد التأكيد.</Alert>
        )}
      </Modal>
    );
  }, [isOpen, options, handleClose]);

  return { confirm, ConfirmDialog };
}
