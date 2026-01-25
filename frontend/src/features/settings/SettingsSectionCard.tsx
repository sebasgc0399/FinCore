import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SettingsSectionCardProps = {
  to: string
  title: string
  description: string
  Icon: LucideIcon
}

export const SettingsSectionCard = ({
  to,
  title,
  description,
  Icon,
}: SettingsSectionCardProps) => {
  return (
    <Link className="block" to={to}>
      <Card className="transition-colors hover:border-muted-foreground/30">
        <CardHeader className="flex flex-row items-start gap-3">
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
