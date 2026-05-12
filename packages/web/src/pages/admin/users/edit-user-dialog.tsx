import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { Employee, User, UserRole } from "@/api/types";
import { useUpdateUser } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { VStack } from "@/components/shared/VStack";
import { TextCaption } from "@/components/shared/text-caption";
import { ROLE_OPTIONS } from "./data";

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  employees: Employee[];
  onClose: () => void;
}

export function EditUserDialog({
  open,
  user,
  employees,
  onClose,
}: EditUserDialogProps) {
  const { t } = useTranslation(["pages", "statuses"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("CONSULTANT");
  const [employeeLink, setEmployeeLink] = useState("none");
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setEmployeeLink(user.employeeId ?? "none");
  }, [user]);

  function handleSave() {
    if (!user) return;
    if (!name.trim() || !email.trim()) {
      toast.error(t("pages:users.dialog.validation"));
      return;
    }

    updateUser.mutate(
      {
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        role,
        employeeId: employeeLink === "none" ? null : employeeLink,
      },
      {
        onSuccess: (updated) => {
          toast.success(t("pages:users.dialog.updatedToast", { name: updated.name }));
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : t("pages:users.dialog.updateFailed"));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <DialogHeader>
          <DialogTitle>{t("pages:users.dialog.editTitle")}</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label={t("pages:users.dialog.fullName")} htmlFor="eu-name">
            <Input
              id="eu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label={t("pages:users.dialog.email")} htmlFor="eu-email">
            <Input
              id="eu-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label={t("pages:users.dialog.role")} htmlFor="eu-role">
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger id="eu-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {t(`statuses:role.${roleOption}`, { defaultValue: roleOption })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={t("pages:users.dialog.linkedEmployee")} htmlFor="eu-employee">
            <Select value={employeeLink} onValueChange={setEmployeeLink}>
              <SelectTrigger id="eu-employee">
                <SelectValue placeholder={t("pages:users.dialog.nonePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("pages:users.dialog.none")}</SelectItem>
                {employees
                  .filter(
                    (employee) =>
                      employee.active || employee.id === user?.employeeId,
                  )
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <TextCaption>
              {t("pages:users.dialog.linkedCaption")}
            </TextCaption>
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={updateUser.isPending}>
            {t("pages:users.dialog.cancel")}
          </Button>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? t("pages:users.dialog.saving") : t("pages:users.dialog.save")}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
