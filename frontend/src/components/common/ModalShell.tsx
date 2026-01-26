import { useEffect, useRef, type ReactNode } from "react"

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
  snapPoints?: Array<number | string>
  activeSnapPoint?: number | string
  closeThreshold?: number
  setActiveSnapPoint?: (snapPoint: number | string | null) => void
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
  setActiveSnapPoint,
  contentClassName,
}: ModalShellProps) => {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const mobileContentClassName = contentClassName ?? ""
  const mobileGutterClassName = "px-5"
  const descriptionProps = description
    ? {}
    : { "aria-describedby": undefined }
  const contentRef = useRef<HTMLDivElement | null>(null)

  const focusFirstInteractive = (): void => {
    const root = contentRef.current
    if (!root) {
      return
    }

    const focusable = root.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusable) {
      focusable.focus()
      return
    }

    root.focus()
  }

  const handleOpenChange = (nextOpen: boolean): void => {
    if (nextOpen && typeof document !== "undefined") {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    }

    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (!open || isMobile || typeof window === "undefined") {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      focusFirstInteractive()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, isMobile])

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        closeThreshold={closeThreshold}
        setActiveSnapPoint={setActiveSnapPoint}
      >
        <DrawerContent
          ref={contentRef}
          tabIndex={-1}
          {...descriptionProps}
          className={cn(
            "inset-x-0 bottom-0 top-auto flex w-full max-h-[90vh] flex-col overflow-hidden rounded-t-2xl rounded-b-none border-t pt-4 pb-[env(safe-area-inset-bottom)]",
            mobileContentClassName
          )}
        >
          <div
            className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/20"
            aria-hidden="true"
          />
          <DrawerHeader
            className={cn("p-0 text-left", mobileGutterClassName)}
          >
            <DrawerTitle>{title}</DrawerTitle>
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : null}
          </DrawerHeader>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto pt-3",
              mobileGutterClassName
            )}
          >
            {children}
          </div>
          {footer ? (
            <DrawerFooter className={cn("p-0 pt-3", mobileGutterClassName)}>
              {footer}
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        {...descriptionProps}
        className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden"
      >
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">{children}</div>
        {footer ? <DialogFooter className="pt-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
