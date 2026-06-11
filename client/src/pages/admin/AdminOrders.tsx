import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import AdminLayout from "./AdminLayout";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700", pending_payment: "bg-amber-100 text-amber-700",
  pending_settlement: "bg-blue-100 text-blue-700", failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600", expired: "bg-gray-100 text-gray-600",
};
const STATUS_LABELS: Record<string, string> = {
  paid: "مدفوع", pending_payment: "معلق", pending_settlement: "تسوية",
  failed: "فشل", cancelled: "ملغي", expired: "منتهي",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminOrders() {
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = trpc.orders.adminList.useQuery({ limit: 100 });

  return (
    <AdminLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إدارة الطلبات</h1>
          <p className="text-gray-400 text-sm mt-1">{orders?.length ?? 0} طلب</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">رقم الطلب</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">العميل</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">التاريخ</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">طريقة الدفع</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">المبلغ</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/order/${order.orderNumber}`)}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-gray-600" dir="ltr">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{order.customerFullName}</div>
                        <div className="text-xs text-gray-400">{order.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 capitalize">{order.paymentMethod}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">{parseFloat(String(order.totalAmount)).toFixed(2)} {order.currency}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-500 mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد طلبات</h3>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
