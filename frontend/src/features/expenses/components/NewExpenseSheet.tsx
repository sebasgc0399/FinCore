import { useState } from "react"

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
  const [snapPoint, setSnapPoint] = useState<number>(0.9)

  const handleOpenChange = (nextOpen: boolean): void => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setSnapPoint(0.9)
    }
  }

  const handleClose = (): void => {
    handleOpenChange(false)
  }

  const handleSnapPointChange = (
    nextSnapPoint: number | string | null
  ): void => {
    if (typeof nextSnapPoint === "number") {
      setSnapPoint(nextSnapPoint)
    }
  }

  return (
    <ModalShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Nuevo gasto"
      description="En construcción."
      snapPoints={[0.5, 0.9]}
      activeSnapPoint={snapPoint}
      setActiveSnapPoint={handleSnapPointChange}
      closeThreshold={0.2}
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
