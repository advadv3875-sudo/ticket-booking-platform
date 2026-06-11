import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users } from "lucide-react";
import AdminLayout from "./AdminLayout";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700", organizer: "bg-purple-100 text-purple-700", user: "bg-gray-100 text-gray-600",
};
const ROLE_LABELS: Record<string, string> = { admin: "مدير", organizer: "منظم", user: "مستخدم" };

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.admin.users.useQuery();
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الدور"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const handleRoleChange = (userId: number, currentRole: string) => {
    const roles = ["user", "organizer", "admin"];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length] as any;
    if (confirm(`تغيير الدور إلى "${ROLE_LABELS[nextRole]}"؟`)) {
      updateRole.mutate({ userId, role: nextRole });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إدارة المستخدمين</h1>
          <p className="text-gray-400 text-sm mt-1">{users?.length ?? 0} مستخدم</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />)}
          </div>
        ) : users && users.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">المستخدم</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">البريد</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">تاريخ التسجيل</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الدور</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0) ?? "U"}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{user.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email ?? "—"}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, user.role)}
                        className="text-xs h-7 border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
                        disabled={updateRole.isPending}
                      >
                        تغيير الدور
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-500" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا يوجد مستخدمون</h3>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
