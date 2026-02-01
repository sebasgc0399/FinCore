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
  title: ReactNode
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
  const hasSnapPoints = Boolean(snapPoints?.length)
  const hasFooter = Boolean(footer)
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
        {...(hasSnapPoints
          ? {
              snapPoints,
              activeSnapPoint,
              closeThreshold,
              setActiveSnapPoint,
            }
          : {})}
      >
        <DrawerContent
          ref={contentRef}
          tabIndex={-1}
          {...descriptionProps}
          className={cn(
            "inset-x-0 bottom-0 top-auto w-full rounded-t-2xl rounded-b-none border-t bg-background",
            mobileContentClassName
          )}
        >
          <div
            className={cn(
              "flex w-full max-h-[95dvh] flex-col overflow-hidden pt-4"
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
                !hasFooter && "pb-[calc(env(safe-area-inset-bottom)+12px)]",
                mobileGutterClassName
              )}
            >
              {children}
            </div>
            {footer ? (
              <DrawerFooter
                className={cn(
                  "shrink-0 p-0 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]",
                  mobileGutterClassName
                )}
              >
                {footer}
              </DrawerFooter>
            ) : null}
          </div>
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
        {footer ? (
          <DialogFooter className="pt-4 pb-2">{footer}</DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
