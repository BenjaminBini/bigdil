import { useEffect, useState } from "react";
import { toast } from "sonner";
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
      toast.error("Name and email are required");
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
          toast.success(`User "${updated.name}" updated`);
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update user");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent size="sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <VStack gap="xl">
          <FormField label="Full Name" htmlFor="eu-name">
            <Input
              id="eu-name"
              placeholder="e.g. Marie Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Email" htmlFor="eu-email">
            <Input
              id="eu-email"
              type="email"
              placeholder="e.g. marie.dupont@acme.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Role" htmlFor="eu-role">
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
                    {roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Linked Employee" htmlFor="eu-employee">
            <Select value={employeeLink} onValueChange={setEmployeeLink}>
              <SelectTrigger id="eu-employee">
                <SelectValue placeholder="None (admin/PM/exec)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">- None -</SelectItem>
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
              Link to an employee record for timesheet access
            </TextCaption>
          </FormField>
        </VStack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={updateUser.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
