import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Percent, DollarSign } from "lucide-react";

export default function AdminCoupons() {
  const { data: coupons, refetch } = trpc.coupons.list.useQuery();
  const createCoupon = trpc.coupons.create.useMutation({ onSuccess: () => { toast.success("تم إنشاء الكوبون بنجاح"); refetch(); setShowForm(false); resetForm(); } });
  const toggleCoupon = trpc.coupons.toggle.useMutation({ onSuccess: () => { toast.success("تم تحديث حالة الكوبون"); refetch(); } });
  const deleteCoupon = trpc.coupons.delete.useMutation({ onSuccess: () => { toast.success("تم حذف الكوبون"); refetch(); } });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    usageLimit: "",
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: "",
  });

  const resetForm = () => setForm({
    code: "", description: "", discountType: "percentage", discountValue: "",
    minOrderAmount: "0", maxDiscountAmount: "", usageLimit: "",
    validFrom: new Date().toISOString().slice(0, 10), validUntil: "",
  });

  const handleCreate = () => {
    if (!form.code || !form.discountValue) { toast.error("يرجى ملء الحقول المطلوبة"); return; }
    createCoupon.mutate({
      code: form.code,
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: parseFloat(form.minOrderAmount) || 0,
      maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      validFrom: new Date(form.validFrom).getTime(),
      validUntil: form.validUntil ? new Date(form.validUntil).getTime() : undefined,
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("تم نسخ الكود");
  };

  const formatDate = (ts: number | null) => {
    if (!ts) return "غير محدد";
    return new Date(ts).toLocaleDateString("ar-JO");
  };

  return (
    <AdminLayout>
      <div dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              إدارة الكوبونات
            </h1>
            <p className="text-gray-400 mt-1">إنشاء وإدارة كوبونات الخصم</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            كوبون جديد
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              إنشاء كوبون جديد
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">كود الخصم *</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: EXPERT20"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">الوصف</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف الكوبون"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">نوع الخصم *</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, discountType: "percentage" })}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${form.discountType === "percentage" ? "border-amber-400 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"}`}
                  >
                    <Percent className="w-4 h-4" /> نسبة مئوية
                  </button>
                  <button
                    onClick={() => setForm({ ...form, discountType: "fixed" })}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${form.discountType === "fixed" ? "border-amber-400 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"}`}
                  >
                    <DollarSign className="w-4 h-4" /> مبلغ ثابت
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  قيمة الخصم * {form.discountType === "percentage" ? "(%)" : "(مبلغ)"}
                </label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percentage" ? "20" : "10"}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">الحد الأدنى للطلب</label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">الحد الأقصى للخصم</label>
                  <Input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="غير محدد"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">عدد مرات الاستخدام</label>
                <Input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="غير محدود"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">تاريخ البداية *</label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">تاريخ الانتهاء</label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={createCoupon.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {createCoupon.isPending ? "جاري الإنشاء..." : "إنشاء الكوبون"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="border-white/20 text-gray-300">
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {!coupons || coupons.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد كوبونات بعد</p>
              <p className="text-gray-600 text-sm mt-1">أنشئ أول كوبون خصم الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">الكود</th>
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">الخصم</th>
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">الاستخدام</th>
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">الصلاحية</th>
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">الحالة</th>
                    <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon: any) => (
                    <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/10 px-3 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                          <button onClick={() => copyCode(coupon.code)} className="text-gray-500 hover:text-gray-300 transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-gray-500 text-xs mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {coupon.discount_type === "percentage"
                            ? `${parseFloat(coupon.discount_value)}%`
                            : `${parseFloat(coupon.discount_value)} ثابت`}
                        </span>
                        {coupon.min_order_amount > 0 && (
                          <p className="text-gray-500 text-xs mt-0.5">حد أدنى: {coupon.min_order_amount}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">
                          {coupon.used_count ?? 0}
                          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / ∞"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-400">
                          <p>من: {formatDate(coupon.valid_from)}</p>
                          <p>حتى: {formatDate(coupon.valid_until)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${coupon.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                          {coupon.is_active ? "نشط" : "معطّل"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCoupon.mutate({ id: coupon.id, isActive: !coupon.is_active })}
                            className="text-gray-400 hover:text-amber-400 transition-colors"
                            title={coupon.is_active ? "تعطيل" : "تفعيل"}
                          >
                            {coupon.is_active
                              ? <ToggleRight className="w-5 h-5 text-emerald-400" />
                              : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => { if (confirm("هل أنت متأكد من حذف هذا الكوبون؟")) deleteCoupon.mutate({ id: coupon.id }); }}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
