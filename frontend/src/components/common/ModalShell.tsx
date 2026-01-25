import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/useMediaQuery"

type ModalShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  snapPoints?: number[]
  activeSnapPoint?: number
  closeThreshold?: number
  contentClassName?: string
}

export const ModalShell = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  snapPoints,
  activeSnapPoint,
  closeThreshold,
  contentClassName,
}: ModalShellProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const mobileContentClassName = contentClassName ?? "max-h-[90vh]"

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        closeThreshold={closeThreshold}
      >
        <DrawerContent
          className={cn(
            "inset-x-0 bottom-0 top-auto w-full rounded-t-2xl rounded-b-none border-t p-6 pt-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto",
            mobileContentClassName
          )}
        >
          <div
            className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted-foreground/20"
            aria-hidden="true"
          />
          <DrawerHeader className="p-0 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : null}
          </DrawerHeader>
          <div className="pt-4">{children}</div>
          {footer ? (
            <DrawerFooter className="p-0 pt-4">{footer}</DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="pt-4">{children}</div>
        {footer ? <DialogFooter className="pt-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
