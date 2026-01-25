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
