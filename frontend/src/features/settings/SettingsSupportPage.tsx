import { type ChangeEvent, type FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type SupportType = "bug" | "suggestion"

type SupportFormState = {
  type: SupportType
  subject: string
  message: string
  email: string
}

export const SettingsSupportPage = () => {
  const { t } = useTranslation("settings")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formState, setFormState] = useState<SupportFormState>({
    type: "bug",
    subject: "",
    message: "",
    email: "",
  })

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const nextType = event.target.value === "suggestion" ? "suggestion" : "bug"
    setFormState((current) => ({ ...current, type: nextType }))
  }

  const handleSubjectChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormState((current) => ({ ...current, subject: event.target.value }))
  }

  const handleMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setFormState((current) => ({ ...current, message: event.target.value }))
  }

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormState((current) => ({ ...current, email: event.target.value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("support.description")}
      </p>

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="support-type">{t("support.form.typeLabel")}</Label>
              <select
                id="support-type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onChange={handleTypeChange}
                value={formState.type}
              >
                <option value="bug">
                  {t("support.form.typeOptions.bug")}
                </option>
                <option value="suggestion">
                  {t("support.form.typeOptions.suggestion")}
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-subject">
                {t("support.form.subjectLabel")}
              </Label>
              <Input
                id="support-subject"
                onChange={handleSubjectChange}
                required
                value={formState.subject}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-message">
                {t("support.form.messageLabel")}
              </Label>
              <Textarea
                id="support-message"
                onChange={handleMessageChange}
                required
                rows={5}
                value={formState.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email">
                {t("support.form.emailLabel")}
              </Label>
              <Input
                id="support-email"
                onChange={handleEmailChange}
                type="email"
                value={formState.email}
              />
            </div>

            <Button type="submit">{t("support.form.submit")}</Button>
          </form>
        </CardContent>
      </Card>

      {isSubmitted ? (
        <div
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
          role="status"
        >
          <span className="font-medium">
            {t("support.form.successTitle")}
          </span>{" "}
          {t("support.form.successMessage")}
        </div>
      ) : null}
    </section>
  )
}
