import { useState } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

type NewExpenseSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewExpenseSheet = ({
  open,
  onOpenChange,
}: NewExpenseSheetProps) => {
  const [snapPoint, setSnapPoint] = useState<number>(0.9)

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[0.5, 0.9]}
      activeSnapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
      closeThreshold={0.2}
    >
      <DrawerContent
        className="inset-x-0 bottom-0 top-auto max-h-[90vh] min-h-[50vh] w-full rounded-t-2xl rounded-b-none border-0 border-t p-6 pt-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto mt-0 transition-transform duration-300 ease-out"
      >
        <div
          className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted-foreground/20"
          aria-hidden="true"
        />
        <DrawerHeader className="p-0 text-left">
          <DrawerTitle>Nuevo gasto</DrawerTitle>
          <DrawerDescription>En construcción.</DrawerDescription>
        </DrawerHeader>
        <div className="text-sm text-muted-foreground">
          Nuevo gasto — En construcción.
        </div>
        <DrawerFooter className="p-0 pt-2">
          <DrawerClose asChild>
            <Button type="button" variant="secondary">
              Cerrar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
