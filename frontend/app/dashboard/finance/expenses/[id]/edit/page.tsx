import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExpenseForm } from "@/components/expense-form"
import { cookies } from "next/headers"
import { getProfile } from "@/lib/inventoryApi"
import { getExpenseById } from "@/lib/expensesApi"

export default async function EditExpensePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
        redirect("/auth/login")
    }

    let profile
    let expense
    try {
        const profileData = await getProfile(token)
        profile = profileData.user || profileData.data

        const expenseData = await getExpenseById(params.id, token)
        expense = expenseData.data
    } catch (error) {
        redirect("/dashboard/finance/expenses")
    }

    if (!expense) {
        redirect("/dashboard/finance/expenses")
    }

    return (
        <DashboardLayout userRole={profile?.role} userName={profile?.fullName || profile?.username}>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Expense</h2>
                    <p className="text-muted-foreground">Updating record: {expense.title}</p>
                </div>

                <ExpenseForm expense={expense} />
            </div>
        </DashboardLayout>
    )
}
