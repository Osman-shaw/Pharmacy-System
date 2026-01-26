export interface HelpArticle {
    id: string
    title: string
    category: string
    content: string
    keywords: string[]
}

export const helpCategories = [
    { id: "dashboard", name: "Dashboard & Analytics", icon: "LayoutDashboard" },
    { id: "inventory", name: "Inventory Management", icon: "Package" },
    { id: "sales", name: "Sales & POS", icon: "ShoppingCart" },
    { id: "purchases", name: "Purchases & Suppliers", icon: "Truck" },
    { id: "hr", name: "HR & Payroll", icon: "Users" },
    { id: "finance", name: "Finance", icon: "DollarSign" },
    { id: "customers", name: "Customers & Prescriptions", icon: "UserCheck" },
    { id: "settings", name: "Settings & Users", icon: "Settings" },
]

export const helpArticles: HelpArticle[] = [
    // Dashboard & Analytics
    {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        category: "dashboard",
        keywords: ["dashboard", "overview", "metrics", "analytics"],
        content: `# Dashboard Overview

The dashboard provides a real-time snapshot of your pharmacy's operations.

## Key Metrics
- **Total Sales**: Today's revenue and comparison with previous periods
- **Low Stock Items**: Medicines below reorder threshold
- **Expiring Soon**: Products nearing expiry date (within 30 days)
- **Pending Prescriptions**: Unfulfilled prescription orders

## Why It Matters
Quick visibility into critical metrics helps you:
- Make informed purchasing decisions
- Prevent stockouts of essential medicines
- Reduce losses from expired inventory
- Improve customer service with faster prescription fulfillment

## Best Practices
- Check dashboard daily at opening
- Address low stock items immediately
- Review expiring items weekly
- Process pending prescriptions within 24 hours`
    },
    {
        id: "sales-analytics",
        title: "Sales Analytics & Reports",
        category: "dashboard",
        keywords: ["sales", "analytics", "reports", "revenue"],
        content: `# Sales Analytics & Reports

Comprehensive sales reporting helps track pharmacy performance.

## Available Reports
- **Daily Sales Summary**: Revenue, transactions, top products
- **Monthly Trends**: Compare performance across months
- **Product Performance**: Best and worst selling items
- **Profit Margins**: Track profitability by product category

## Operational Benefits
- **Inventory Planning**: Stock popular items adequately
- **Pricing Strategy**: Identify high-margin products
- **Staff Performance**: Track sales by cashier/pharmacist
- **Business Growth**: Identify trends and opportunities

## How to Use
1. Navigate to Analytics section
2. Select date range
3. Choose report type
4. Export to PDF/Excel for records`
    },

    // Inventory Management
    {
        id: "inventory-management",
        title: "Inventory Management",
        category: "inventory",
        keywords: ["inventory", "stock", "medicines", "products"],
        content: `# Inventory Management

Effective inventory management is crucial for pharmacy operations.

## Core Functions
- **Add New Medicines**: Register products with complete details
- **Update Stock Levels**: Track quantities accurately
- **Set Reorder Points**: Automate low stock alerts
- **Batch Tracking**: Monitor specific batches for recalls
- **Expiry Management**: Track and rotate stock by expiry date

## Why It's Important
Proper inventory management:
- Prevents stockouts of critical medicines
- Reduces waste from expired products
- Ensures regulatory compliance
- Optimizes working capital
- Improves customer satisfaction

## Required Information
- Medicine name (brand and generic)
- Manufacturer details
- Batch number and expiry date
- Cost price and selling price
- Storage requirements
- Dosage form and strength

## Best Practices
- Use FEFO (First Expiry, First Out) rotation
- Conduct monthly physical stock counts
- Maintain 2-3 months safety stock for essentials
- Review slow-moving items quarterly`
    },
    {
        id: "expiry-tracking",
        title: "Expiry Date Tracking",
        category: "inventory",
        keywords: ["expiry", "expiration", "waste", "rotation"],
        content: `# Expiry Date Tracking

Preventing expired stock is critical for patient safety and profitability.

## System Features
- **Automatic Alerts**: Notifications 90, 60, and 30 days before expiry
- **Expiry Dashboard**: Visual overview of expiring stock
- **FEFO Enforcement**: System suggests oldest stock first
- **Batch Tracking**: Monitor multiple batches separately

## Regulatory Requirements
- Sierra Leone Pharmacy Board requires:
  - No dispensing of expired medicines
  - Proper disposal documentation
  - Regular expiry audits
  - Segregation of near-expiry stock

## Action Steps
1. **90 Days**: Plan promotions or return to supplier
2. **60 Days**: Offer discounts to move stock
3. **30 Days**: Segregate and prepare for disposal
4. **Expired**: Document and dispose per regulations

## Cost Impact
Expired stock represents:
- Direct financial loss
- Storage space waste
- Regulatory compliance risk
- Reputation damage if dispensed`
    },

    // Sales & POS
    {
        id: "pos-system",
        title: "Point of Sale (POS) System",
        category: "sales",
        keywords: ["pos", "sales", "checkout", "cashier"],
        content: `# Point of Sale (POS) System

The POS system streamlines customer transactions and sales recording.

## How It Works
1. **Search Medicine**: Type name or scan barcode
2. **Add to Cart**: Select quantity and verify price
3. **Apply Discounts**: If authorized
4. **Process Payment**: Cash, mobile money, or credit
5. **Print Receipt**: Automatic receipt generation
6. **Update Stock**: Real-time inventory deduction

## Key Features
- **Fast Search**: Find medicines quickly by name/generic
- **Stock Verification**: Prevents overselling
- **Price Display**: Shows current selling price
- **Running Total**: Live cart total calculation
- **Payment Methods**: Multiple payment options
- **Receipt Printing**: Professional invoices

## Operational Benefits
- **Speed**: Faster customer service
- **Accuracy**: Eliminates manual calculation errors
- **Tracking**: Every sale is recorded
- **Inventory**: Automatic stock updates
- **Reporting**: Real-time sales data

## Best Practices
- Verify customer identity for prescriptions
- Double-check quantities before finalizing
- Offer receipt to all customers
- Count cash drawer at shift start/end
- Report discrepancies immediately`
    },
    {
        id: "invoicing-receipts",
        title: "Invoicing & Receipts",
        category: "sales",
        keywords: ["invoice", "receipt", "billing", "payment"],
        content: `# Invoicing & Receipts

Professional invoicing ensures compliance and customer trust.

## Receipt Components
- **Invoice Number**: Unique transaction identifier
- **Date & Time**: Transaction timestamp
- **Customer Details**: Name and contact (if provided)
- **Item List**: Products, quantities, prices
- **Subtotal & Tax**: Breakdown of charges
- **Payment Method**: How customer paid
- **Pharmacist Name**: Who processed sale

## Legal Requirements
Sierra Leone regulations require:
- Receipts for all transactions over Le 50,000
- VAT registration number (if applicable)
- Pharmacy license number
- Retention of copies for 7 years

## Email Receipts
System can email receipts for:
- Customer records
- Insurance claims
- Expense reimbursement
- Warranty purposes

## Why It Matters
Proper receipts:
- Build customer trust
- Enable returns/exchanges
- Support insurance claims
- Provide audit trail
- Meet tax requirements`
    },

    // Purchases & Suppliers
    {
        id: "supplier-management",
        title: "Supplier Management",
        category: "purchases",
        keywords: ["supplier", "vendor", "wholesaler"],
        content: `# Supplier Management

Maintaining good supplier relationships ensures reliable medicine supply.

## Supplier Information
Track essential details:
- **Legal Name**: Official business name
- **Contact Person**: Primary contact
- **Phone & Email**: Communication channels
- **Physical Address**: For deliveries and visits
- **TIN**: Tax Identification Number
- **Pharmacy Board Registration**: Verify legitimacy
- **Payment Terms**: Credit period and conditions

## Why It's Important
Good supplier management:
- Ensures medicine availability
- Enables better pricing negotiations
- Provides credit facilities
- Facilitates product returns
- Supports quality assurance

## Supplier Evaluation
Assess suppliers on:
- **Reliability**: On-time deliveries
- **Quality**: Product authenticity
- **Pricing**: Competitive rates
- **Credit Terms**: Payment flexibility
- **Support**: Technical assistance

## Best Practices
- Maintain 3-5 reliable suppliers
- Verify licenses and certifications
- Document all communications
- Review performance quarterly
- Build long-term relationships`
    },
    {
        id: "purchase-orders",
        title: "Purchase Orders & Receiving",
        category: "purchases",
        keywords: ["purchase", "order", "receiving", "stock"],
        content: `# Purchase Orders & Receiving

Systematic purchasing ensures optimal stock levels and cost control.

## Purchase Order Process
1. **Identify Need**: Review low stock reports
2. **Create PO**: Select supplier and items
3. **Submit Order**: Send to supplier
4. **Track Delivery**: Monitor expected arrival
5. **Receive Goods**: Verify against PO
6. **Update System**: Record receipt and update stock

## Key Information
- **PO Number**: Unique identifier
- **Supplier Details**: Who you're ordering from
- **Item List**: Products and quantities
- **Unit Prices**: Agreed costs
- **Total Amount**: Order value
- **Expected Delivery**: When to expect goods
- **Payment Terms**: When payment is due

## Receiving Best Practices
When goods arrive:
- **Verify Quantity**: Count all items
- **Check Quality**: Inspect for damage
- **Confirm Expiry**: Ensure adequate shelf life
- **Match Invoice**: Compare with PO
- **Update Stock**: Record in system immediately
- **Store Properly**: Follow storage requirements

## Cost Control
- Order in economic quantities
- Negotiate bulk discounts
- Compare supplier prices
- Track price trends
- Monitor order accuracy`
    },

    // HR & Payroll
    {
        id: "employee-management",
        title: "Employee Management",
        category: "hr",
        keywords: ["employee", "staff", "hr", "personnel"],
        content: `# Employee Management

Effective staff management ensures smooth pharmacy operations.

## Employee Records
Maintain complete information:
- **Personal Details**: Name, contact, ID
- **Position**: Role and responsibilities
- **Qualifications**: Licenses, certifications
- **Employment Date**: Start date and contract
- **Salary**: Basic pay and allowances
- **Bank Details**: For salary payments
- **Emergency Contact**: For urgent situations

## Staff Roles
- **Pharmacist**: Licensed to dispense prescriptions
- **Pharmacy Technician**: Assist with dispensing
- **Cashier**: Handle sales transactions
- **Stock Clerk**: Manage inventory
- **Manager**: Oversee operations

## Regulatory Compliance
- Verify pharmacist licenses with Pharmacy Board
- Maintain CPD (Continuing Professional Development) records
- Ensure adequate pharmacist coverage during hours
- Document training and competency assessments

## Why It Matters
Proper HR management:
- Ensures qualified staff
- Maintains regulatory compliance
- Supports payroll accuracy
- Facilitates performance management
- Protects against legal issues`
    },
    {
        id: "attendance-payroll",
        title: "Attendance & Payroll",
        category: "hr",
        keywords: ["attendance", "payroll", "salary", "wages"],
        content: `# Attendance & Payroll

Accurate attendance tracking ensures fair compensation and cost control.

## Attendance System
- **Clock In/Out**: Record work hours
- **Leave Management**: Track vacation, sick leave
- **Overtime**: Monitor extra hours
- **Absences**: Record and approve
- **Shift Scheduling**: Plan coverage

## Payroll Processing
Monthly payroll includes:
- **Basic Salary**: Agreed monthly pay
- **Allowances**: Transport, housing, etc.
- **Overtime**: Extra hours worked
- **Deductions**: Tax, NASSIT, advances
- **Net Pay**: Final amount to employee

## Sierra Leone Requirements
- **NASSIT**: 10% employer + 5% employee
- **PAYE**: Progressive income tax
- **Minimum Wage**: Comply with national standards
- **Payment Deadline**: By 28th of each month

## Best Practices
- Process payroll by 25th for month-end payment
- Provide detailed payslips
- Maintain payroll records for 7 years
- Reconcile attendance before processing
- File tax returns on time

## Benefits
Systematic payroll:
- Ensures timely payments
- Maintains staff morale
- Supports tax compliance
- Provides audit trail
- Reduces disputes`
    },

    // Finance
    {
        id: "expense-tracking",
        title: "Expense Tracking",
        category: "finance",
        keywords: ["expense", "costs", "spending"],
        content: `# Expense Tracking

Monitoring expenses is crucial for profitability and financial health.

## Expense Categories
- **Rent**: Premises lease
- **Utilities**: Electricity, water, internet
- **Salaries**: Staff compensation
- **Supplies**: Non-medicine items
- **Marketing**: Advertising, promotions
- **Maintenance**: Repairs, upkeep
- **Licenses**: Regulatory fees
- **Insurance**: Business coverage
- **Transportation**: Delivery, travel

## Why Track Expenses
- **Profitability**: Understand true costs
- **Budgeting**: Plan future spending
- **Tax Compliance**: Claim deductions
- **Cost Control**: Identify savings
- **Decision Making**: Data-driven choices

## Recording Expenses
For each expense:
- Date of transaction
- Category and description
- Amount paid
- Payment method
- Receipt/invoice number
- Attach supporting documents

## Monthly Review
- Compare actual vs. budget
- Identify unusual spending
- Look for cost-saving opportunities
- Adjust future budgets
- Report to management`
    },
    {
        id: "financial-reports",
        title: "Financial Reports & P&L",
        category: "finance",
        keywords: ["profit", "loss", "financial", "reports"],
        content: `# Financial Reports & Profit/Loss

Financial reports provide insights into business performance.

## Profit & Loss Statement
Shows profitability over a period:
- **Revenue**: Total sales
- **Cost of Goods Sold**: Medicine costs
- **Gross Profit**: Revenue - COGS
- **Operating Expenses**: Rent, salaries, utilities
- **Net Profit**: Gross Profit - Expenses

## Key Metrics
- **Gross Margin**: (Gross Profit / Revenue) × 100
- **Net Margin**: (Net Profit / Revenue) × 100
- **Operating Ratio**: (Expenses / Revenue) × 100
- **Inventory Turnover**: COGS / Average Inventory

## Monthly Reporting
Generate reports to:
- Assess profitability
- Compare with targets
- Identify trends
- Make adjustments
- Plan for growth

## Operational Insights
Reports help you:
- Price products correctly
- Control expenses
- Manage cash flow
- Secure financing
- Maximize profits

## Best Practices
- Review monthly P&L
- Compare year-over-year
- Set realistic targets
- Act on insights quickly
- Maintain accurate records`
    },

    // Customers & Prescriptions
    {
        id: "customer-management",
        title: "Customer Management",
        category: "customers",
        keywords: ["customer", "patient", "client"],
        content: `# Customer Management

Building customer relationships drives loyalty and repeat business.

## Customer Information
Track key details:
- **Name**: Full customer name
- **Contact**: Phone and email
- **Address**: For deliveries
- **Medical History**: Allergies, conditions
- **Insurance**: Coverage details
- **Purchase History**: Past transactions
- **Preferences**: Communication preferences

## Why It Matters
Customer data helps:
- **Personalize Service**: Remember preferences
- **Track Prescriptions**: Refill reminders
- **Loyalty Programs**: Reward repeat customers
- **Marketing**: Targeted communications
- **Insurance**: Process claims faster

## Privacy & Compliance
- Obtain consent for data collection
- Secure medical information
- Comply with data protection laws
- Allow customer access to their data
- Respect communication preferences

## Customer Service
- Greet customers warmly
- Maintain confidentiality
- Provide professional advice
- Follow up on prescriptions
- Handle complaints promptly`
    },
    {
        id: "prescription-handling",
        title: "Prescription Handling",
        category: "customers",
        keywords: ["prescription", "rx", "doctor", "medication"],
        content: `# Prescription Handling

Proper prescription management ensures patient safety and regulatory compliance.

## Prescription Requirements
Valid prescriptions must have:
- **Patient Name**: Full name
- **Date**: When prescribed
- **Doctor Details**: Name, license, signature
- **Medicine**: Generic or brand name
- **Dosage**: Strength and form
- **Quantity**: Amount to dispense
- **Instructions**: How to take
- **Refills**: If applicable

## Verification Process
1. **Check Validity**: Ensure prescription is current
2. **Verify Doctor**: Confirm licensed practitioner
3. **Review Medicine**: Check for interactions
4. **Confirm Dosage**: Appropriate for patient
5. **Counsel Patient**: Explain usage
6. **Document**: Record in system

## Regulatory Compliance
Sierra Leone Pharmacy Board requires:
- Retain prescriptions for 2 years
- Pharmacist must verify and sign
- Controlled substances need special handling
- Report adverse drug reactions
- Maintain dispensing records

## Patient Counseling
Explain to patients:
- How to take medicine
- When to take it
- Possible side effects
- Storage requirements
- What to avoid
- When to follow up

## Safety Checks
- Verify patient allergies
- Check drug interactions
- Confirm appropriate dosage
- Ensure adequate supply
- Provide written instructions`
    },

    // Settings & Users
    {
        id: "user-roles",
        title: "User Roles & Permissions",
        category: "settings",
        keywords: ["user", "role", "permission", "access"],
        content: `# User Roles & Permissions

Role-based access control ensures security and accountability.

## Available Roles
- **Admin**: Full system access
- **Pharmacist**: Dispensing, inventory, sales
- **Cashier**: Sales and POS only
- **Manager**: Reports and analytics
- **Stock Clerk**: Inventory management

## Permission Levels
Each role controls:
- **View**: What data they can see
- **Create**: What they can add
- **Edit**: What they can modify
- **Delete**: What they can remove
- **Reports**: What they can access

## Why It Matters
Proper access control:
- **Security**: Protects sensitive data
- **Accountability**: Tracks who did what
- **Compliance**: Meets regulatory requirements
- **Efficiency**: Users see only relevant features
- **Risk Management**: Limits potential damage

## Best Practices
- Assign minimum necessary permissions
- Review user access quarterly
- Disable accounts for departed staff
- Use strong password policies
- Monitor user activity logs
- Train users on their responsibilities`
    },
    {
        id: "system-settings",
        title: "System Settings & Configuration",
        category: "settings",
        keywords: ["settings", "configuration", "setup"],
        content: `# System Settings & Configuration

Proper system configuration ensures optimal performance.

## Key Settings
- **Pharmacy Details**: Name, license, contact
- **Tax Configuration**: VAT rates, tax ID
- **Receipt Format**: Logo, footer text
- **Low Stock Threshold**: When to alert
- **Expiry Alert Days**: Notification timing
- **Currency**: Le (Leones)
- **Date Format**: DD/MM/YYYY
- **Business Hours**: Operating times

## Backup & Security
- **Regular Backups**: Daily automatic backups
- **Data Encryption**: Secure sensitive information
- **Password Policy**: Enforce strong passwords
- **Session Timeout**: Auto-logout after inactivity
- **Audit Logs**: Track all system changes

## Integration Settings
- **Email**: SMTP for receipts and notifications
- **SMS**: Alerts and reminders
- **Payment Gateway**: Mobile money integration
- **Barcode Scanner**: Hardware configuration

## Maintenance
- Update system regularly
- Monitor system performance
- Review error logs
- Clean up old data
- Test backup restoration

## Support
For technical issues:
- Check system status
- Review error messages
- Contact support team
- Document the problem
- Follow troubleshooting steps`
    },
]

export function searchHelp(query: string): HelpArticle[] {
    const lowerQuery = query.toLowerCase()
    return helpArticles.filter(
        (article) =>
            article.title.toLowerCase().includes(lowerQuery) ||
            article.content.toLowerCase().includes(lowerQuery) ||
            article.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
    )
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
    return helpArticles.filter((article) => article.category === categoryId)
}

export function getArticleById(id: string): HelpArticle | undefined {
    return helpArticles.find((article) => article.id === id)
}
