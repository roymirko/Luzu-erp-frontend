import { Button } from '@/app/components/ui/button';

interface FormFooterProps {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  /** Whether form is locked/cerrado. Defaults to false. */
  isCerrado?: boolean;
  /** Label for cancel button when cerrado (e.g. "Volver"). */
  cancelLabelCerrado?: string;
  /** Hide save button when cerrado. Defaults to false. */
  hideSaveWhenCerrado?: boolean;
  /** Disable save button when cerrado. Defaults to false. */
  disableSaveWhenCerrado?: boolean;
  /** Padding top class. Defaults to "pt-8". */
  paddingTop?: string;
}

export function FormFooter({
  saving,
  onCancel,
  onSave,
  isCerrado = false,
  cancelLabelCerrado,
  hideSaveWhenCerrado = false,
  disableSaveWhenCerrado = false,
  paddingTop = 'pt-8',
}: FormFooterProps) {
  const showSave = !(hideSaveWhenCerrado && isCerrado);
  const saveDisabled = saving || (disableSaveWhenCerrado && isCerrado);

  return (
    <div className={`flex justify-end gap-3 ${paddingTop} pb-8`}>
      <Button
        variant="ghost"
        onClick={onCancel}
        className="text-[#0070ff] hover:text-[#0060dd]"
        disabled={saving}
      >
        {isCerrado && cancelLabelCerrado ? cancelLabelCerrado : 'Cancelar'}
      </Button>
      {showSave && (
        <Button
          onClick={onSave}
          className="bg-[#0070ff] hover:bg-[#0060dd] text-white px-8"
          disabled={saveDisabled}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      )}
    </div>
  );
}
