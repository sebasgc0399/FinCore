import { Button } from "@/components/ui/button"
import { ModalShell } from "@/components/common/ModalShell"

type NewExpenseSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewExpenseSheet = ({
  open,
  onOpenChange,
}: NewExpenseSheetProps) => {
  const handleClose = (): void => {
    onOpenChange(false)
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo gasto"
      description="En construcción."
      snapPoints={[0.5, 0.9]}
      activeSnapPoint={0.9}
      closeThreshold={0.2}
      contentClassName="max-h-[90vh] min-h-[90vh]"
      footer={
        <Button type="button" variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      }
    >
      <div className="text-sm text-muted-foreground">
        Nuevo gasto — En construcción.
      </div>
    </ModalShell>
  )
}
