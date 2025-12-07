import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import './AdminFinance.css';
import './AdminFinance_budget.css';

const AdminFinance = () => {
    usePageTitle('Finans Yönetimi');
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('overview'); // overview, income, expenses, recurring_expenses, recurring_income, budget, charts
    const [allIncomeRecords, setAllIncomeRecords] = useState([]);
    const [allExpenseRecords, setAllExpenseRecords] = useState([]);
    const [recurringExpenses, setRecurringExpenses] = useState([]);
    const [recurringIncome, setRecurringIncome] = useState([]);
    const [budgetTargets, setBudgetTargets] = useState([]);
    const [filteredIncome, setFilteredIncome] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Budget state
    const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(new Date().getMonth() + 1);
    const [selectedBudgetYear, setSelectedBudgetYear] = useState(new Date().getFullYear());
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [budgetForm, setBudgetForm] = useState({
        category: 'hosting',
        target_type: 'expense',
        monthly_limit: '',
        notes: ''
    });

    // Date filter state
    const [dateFilter, setDateFilter] = useState('this_month'); // all, this_month, last_month, this_year, custom
    const [customDateRange, setCustomDateRange] = useState({
        start: '',
        end: ''
    });

    // Summary stats
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        incomeCount: 0,
        expenseCount: 0
    });

    // Form states
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showRecurringForm, setShowRecurringForm] = useState(false);
    const [showRecurringIncomeForm, setShowRecurringIncomeForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // ID of record being edited

    const [incomeForm, setIncomeForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'subscription',
        amount: '',
        description: '',
        payment_method: 'paypal',
        invoice_number: ''
    });

    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'hosting',
        amount: '',
        description: '',
        vendor_name: '',
        payment_method: 'bank_transfer',
        is_tax_deductible: true
    });

    const [recurringForm, setRecurringForm] = useState({
        category: 'hosting',
        amount: '',
        description: '',
        vendor_name: '',
        payment_method: 'bank_transfer',
        day_of_month: 1,
        active: true
    });

    const [recurringIncomeForm, setRecurringIncomeForm] = useState({
        category: 'subscription',
        amount: '',
        description: '',
        source_name: '',
        payment_method: 'paypal',
        day_of_month: 1,
        active: true
    });

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        if (user) {
            fetchFinanceData();
            checkRecurringExpenses();
        }
    }, [user]);

    // Apply filters whenever dateFilter, customDateRange, or records change
    useEffect(() => {
        filterData();
    }, [dateFilter, customDateRange, allIncomeRecords, allExpenseRecords]);

    const checkRecurringExpenses = async () => {
        const { error } = await supabase.rpc('process_recurring_expenses');
        if (error) console.error('Error processing recurring expenses:', error);

        const { error: incomeError } = await supabase.rpc('process_recurring_income');
        if (incomeError) console.error('Error processing recurring income:', incomeError);
    };

    const fetchFinanceData = async () => {
        setLoading(true);

        // Fetch income records
        const { data: income } = await supabase
            .from('income_records')
            .select('*')
            .order('date', { ascending: false });

        // Fetch expense records
        const { data: expenses } = await supabase
            .from('expense_records')
            .select('*')
            .order('date', { ascending: false });

        // Fetch recurring expenses
        const { data: recurring } = await supabase
            .from('recurring_expenses')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch recurring income
        const { data: recurringInc } = await supabase
            .from('recurring_income')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch budget targets for current month
        const { data: budgets } = await supabase
            .from('budget_vs_actual')
            .select('*')
            .eq('year', selectedBudgetYear)
            .eq('month', selectedBudgetMonth);

        setAllIncomeRecords(income || []);
        setAllExpenseRecords(expenses || []);
        setRecurringExpenses(recurring || []);
        setRecurringIncome(recurringInc || []);
        setBudgetTargets(budgets || []);
        setLoading(false);
    };

    const handleRecurringSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting recurring expense form...', recurringForm);

        try {
            const submissionData = {
                ...recurringForm,
                amount: parseFloat(recurringForm.amount),
                day_of_month: parseInt(recurringForm.day_of_month)
            };
            console.log('Processed submission data:', submissionData);

            let result;
            if (editingId) {
                console.log('Updating existing record:', editingId);
                result = await supabase
                    .from('recurring_expenses')
                    .update(submissionData)
                    .eq('id', editingId);
            } else {
                console.log('Inserting new record');
                result = await supabase
                    .from('recurring_expenses')
                    .insert([submissionData]);
            }

            const { error, data } = result;

            if (error) {
                console.error('Supabase error:', error);
                alert('Hata oluştu: ' + error.message);
                return;
            }

            console.log('Operation successful:', data);
            alert(editingId ? '✅ Düzenli gider güncellendi!' : '✅ Düzenli gider eklendi!');

            setShowRecurringForm(false);
            setEditingId(null);
            resetRecurringForm();
            fetchFinanceData();
        } catch (err) {
            console.error('Unexpected error in handleRecurringSubmit:', err);
            alert('Beklenmedik bir hata oluştu: ' + err.message);
        }
    };

    const deleteRecurringExpense = async (id) => {
        const { error } = await supabase
            .from('recurring_expenses')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }
        alert('✅ Düzenli gider silindi!');
        fetchFinanceData();
    };

    const toggleRecurringStatus = async (id, currentStatus) => {
        const { error } = await supabase
            .from('recurring_expenses')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }
        fetchFinanceData();
    };

    const resetRecurringForm = () => {
        setRecurringForm({
            category: 'hosting',
            amount: '',
            description: '',
            vendor_name: '',
            payment_method: 'bank_transfer',
            day_of_month: 1,
            active: true
        });
    };

    const openEditRecurring = (record) => {
        setEditingId(record.id);
        setRecurringForm({
            category: record.category,
            amount: record.amount,
            description: record.description,
            vendor_name: record.vendor_name || '',
            payment_method: record.payment_method,
            day_of_month: record.day_of_month,
            active: record.active
        });
        setShowRecurringForm(true);
    };

    // Recurring Income Functions
    const handleRecurringIncomeSubmit = async (e) => {
        e.preventDefault();

        try {
            const submissionData = {
                ...recurringIncomeForm,
                amount: parseFloat(recurringIncomeForm.amount),
                day_of_month: parseInt(recurringIncomeForm.day_of_month)
            };

            let result;
            if (editingId) {
                result = await supabase
                    .from('recurring_income')
                    .update(submissionData)
                    .eq('id', editingId);
            } else {
                result = await supabase
                    .from('recurring_income')
                    .insert([submissionData]);
            }

            const { error } = result;

            if (error) {
                alert('Hata oluştu: ' + error.message);
                return;
            }

            alert(editingId ? '✅ Düzenli gelir güncellendi!' : '✅ Düzenli gelir eklendi!');

            setShowRecurringIncomeForm(false);
            setEditingId(null);
            resetRecurringIncomeForm();
            fetchFinanceData();
        } catch (err) {
            alert('Beklenmedik bir hata oluştu: ' + err.message);
        }
    };

    const deleteRecurringIncome = async (id) => {
        const { error } = await supabase
            .from('recurring_income')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }
        alert('✅ Düzenli gelir silindi!');
        fetchFinanceData();
    };

    const toggleRecurringIncomeStatus = async (id, currentStatus) => {
        const { error } = await supabase
            .from('recurring_income')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }
        fetchFinanceData();
    };

    const resetRecurringIncomeForm = () => {
        setRecurringIncomeForm({
            category: 'subscription',
            amount: '',
            description: '',
            source_name: '',
            payment_method: 'paypal',
            day_of_month: 1,
            active: true
        });
    };

    const openEditRecurringIncome = (record) => {
        setEditingId(record.id);
        setRecurringIncomeForm({
            category: record.category,
            amount: record.amount,
            description: record.description,
            source_name: record.source_name || '',
            payment_method: record.payment_method,
            day_of_month: record.day_of_month,
            active: record.active
        });
        setShowRecurringIncomeForm(true);
    };

    // Budget Functions
    const handleBudgetSubmit = async (e) => {
        e.preventDefault();

        try {
            const submissionData = {
                ...budgetForm,
                monthly_limit: parseFloat(budgetForm.monthly_limit),
                year: selectedBudgetYear,
                month: selectedBudgetMonth
            };

            let result;
            if (editingId) {
                result = await supabase
                    .from('budget_targets')
                    .update(submissionData)
                    .eq('id', editingId);
            } else {
                result = await supabase
                    .from('budget_targets')
                    .insert([submissionData]);
            }

            const { error } = result;

            if (error) {
                alert('Hata oluştu: ' + error.message);
                return;
            }

            alert(editingId ? '✅ Bütçe hedefi güncellendi!' : '✅ Bütçe hedefi eklendi!');

            setShowBudgetForm(false);
            setEditingId(null);
            resetBudgetForm();
            fetchFinanceData();
        } catch (err) {
            alert('Beklenmedik bir hata oluştu: ' + err.message);
        }
    };

    const deleteBudget = async (id) => {
        const { error } = await supabase
            .from('budget_targets')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }
        alert('✅ Bütçe hedefi silindi!');
        fetchFinanceData();
    };

    const resetBudgetForm = () => {
        setBudgetForm({
            category: 'hosting',
            target_type: 'expense',
            monthly_limit: '',
            notes: ''
        });
    };

    const openEditBudget = (record) => {
        setEditingId(record.id);
        setBudgetForm({
            category: record.category,
            target_type: record.target_type,
            monthly_limit: record.monthly_limit,
            notes: record.notes || ''
        });
        setShowBudgetForm(true);
    };

    const filterData = () => {
        let start = new Date(0); // Beginning of time
        let end = new Date(2100, 0, 1); // Far future

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        if (dateFilter === 'this_month') {
            start = new Date(currentYear, currentMonth, 1);
            end = new Date(currentYear, currentMonth + 1, 0);
        } else if (dateFilter === 'last_month') {
            start = new Date(currentYear, currentMonth - 1, 1);
            end = new Date(currentYear, currentMonth, 0);
        } else if (dateFilter === 'this_year') {
            start = new Date(currentYear, 0, 1);
            end = new Date(currentYear, 11, 31);
        } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
            start = new Date(customDateRange.start);
            end = new Date(customDateRange.end);
        }

        const filterByDate = (record) => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        };

        const filteredInc = dateFilter === 'all' ? allIncomeRecords : allIncomeRecords.filter(filterByDate);
        const filteredExp = dateFilter === 'all' ? allExpenseRecords : allExpenseRecords.filter(filterByDate);

        setFilteredIncome(filteredInc);
        setFilteredExpenses(filteredExp);

        // Calculate summary based on filtered data
        const totalIncome = filteredInc.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        const totalExpenses = filteredExp.reduce((sum, r) => sum + parseFloat(r.amount), 0);

        setSummary({
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            incomeCount: filteredInc.length,
            expenseCount: filteredExp.length
        });
    };

    const prepareChartData = () => {
        // Income by Category
        const incomeByCategory = filteredIncome.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
            return acc;
        }, {});

        const incomeChartData = Object.keys(incomeByCategory).map(key => ({
            name: key,
            value: incomeByCategory[key]
        }));

        // Expenses by Category
        const expenseByCategory = filteredExpenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
            return acc;
        }, {});

        const expenseChartData = Object.keys(expenseByCategory).map(key => ({
            name: key,
            value: expenseByCategory[key]
        }));

        return { incomeChartData, expenseChartData };
    };

    const handlePrint = () => {
        window.print();
    };

    const handleIncomeSubmit = async (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from('income_records')
                .update({
                    ...incomeForm,
                    amount: parseFloat(incomeForm.amount)
                })
                .eq('id', editingId);

            if (error) {
                alert('Hata: ' + error.message);
                return;
            }
            alert('✅ Gelir kaydı güncellendi!');
        } else {
            // Create new
            const { error } = await supabase
                .from('income_records')
                .insert([{
                    ...incomeForm,
                    amount: parseFloat(incomeForm.amount)
                }]);

            if (error) {
                alert('Hata: ' + error.message);
                return;
            }
            alert('✅ Gelir kaydı eklendi!');
        }

        setShowIncomeForm(false);
        setEditingId(null);
        resetIncomeForm();
        fetchFinanceData();
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing
            const { error } = await supabase
                .from('expense_records')
                .update({
                    ...expenseForm,
                    amount: parseFloat(expenseForm.amount)
                })
                .eq('id', editingId);

            if (error) {
                alert('Hata: ' + error.message);
                return;
            }
            alert('✅ Gider kaydı güncellendi!');
        } else {
            // Create new
            const { error } = await supabase
                .from('expense_records')
                .insert([{
                    ...expenseForm,
                    amount: parseFloat(expenseForm.amount)
                }]);

            if (error) {
                alert('Hata: ' + error.message);
                return;
            }
            alert('✅ Gider kaydı eklendi!');
        }

        setShowExpenseForm(false);
        setEditingId(null);
        resetExpenseForm();
        fetchFinanceData();
    };

    const resetIncomeForm = () => {
        setIncomeForm({
            date: new Date().toISOString().split('T')[0],
            category: 'subscription',
            amount: '',
            description: '',
            payment_method: 'paypal',
            invoice_number: ''
        });
    };

    const resetExpenseForm = () => {
        setExpenseForm({
            date: new Date().toISOString().split('T')[0],
            category: 'hosting',
            amount: '',
            description: '',
            vendor_name: '',
            payment_method: 'bank_transfer',
            is_tax_deductible: true
        });
    };

    const openEditIncome = (record) => {
        setEditingId(record.id);
        setIncomeForm({
            date: record.date,
            category: record.category,
            amount: record.amount,
            description: record.description,
            payment_method: record.payment_method,
            invoice_number: record.invoice_number || ''
        });
        setShowIncomeForm(true);
    };

    const openEditExpense = (record) => {
        setEditingId(record.id);
        setExpenseForm({
            date: record.date,
            category: record.category,
            amount: record.amount,
            description: record.description,
            vendor_name: record.vendor_name || '',
            payment_method: record.payment_method,
            is_tax_deductible: record.is_tax_deductible
        });
        setShowExpenseForm(true);
    };

    const deleteIncome = async (id) => {
        const { error } = await supabase
            .from('income_records')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        alert('✅ Gelir kaydı silindi!');
        fetchFinanceData();
    };

    const deleteExpense = async (id) => {
        const { error } = await supabase
            .from('expense_records')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Hata: ' + error.message);
            return;
        }

        alert('✅ Gider kaydı silindi!');
        fetchFinanceData();
    };

    if (loading) {
        return <div className="admin-finance"><div className="loading">Yükleniyor...</div></div>;
    }

    const { incomeChartData, expenseChartData } = prepareChartData();

    return (
        <div className="admin-finance">
            <div className="finance-header">
                <h1 data-date={new Date().toLocaleDateString('tr-TR')}>💰 Finans Yönetimi</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        🖨️ Yazdır / PDF
                    </button>
                    {activeTab === 'recurring' ? (
                        <button className="btn btn-info" onClick={() => {
                            setEditingId(null);
                            resetRecurringForm();
                            setShowRecurringForm(true);
                        }}>
                            + Düzenli Gider Ekle
                        </button>
                    ) : activeTab === 'recurring_income' ? (
                        <button className="btn btn-success" onClick={() => {
                            setEditingId(null);
                            resetRecurringIncomeForm();
                            setShowRecurringIncomeForm(true);
                        }}>
                            + Düzenli Gelir Ekle
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-success" onClick={() => {
                                setEditingId(null);
                                resetIncomeForm();
                                setShowIncomeForm(true);
                            }}>
                                + Gelir Ekle
                            </button>
                            <button className="btn btn-danger" onClick={() => {
                                setEditingId(null);
                                resetExpenseForm();
                                setShowExpenseForm(true);
                            }}>
                                + Gider Ekle
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Date Filters */}
            <div className="date-filters">
                <button
                    className={dateFilter === 'all' ? 'active' : ''}
                    onClick={() => setDateFilter('all')}
                >
                    Tümü
                </button>
                <button
                    className={dateFilter === 'this_month' ? 'active' : ''}
                    onClick={() => setDateFilter('this_month')}
                >
                    Bu Ay
                </button>
                <button
                    className={dateFilter === 'last_month' ? 'active' : ''}
                    onClick={() => setDateFilter('last_month')}
                >
                    Geçen Ay
                </button>
                <button
                    className={dateFilter === 'this_year' ? 'active' : ''}
                    onClick={() => setDateFilter('this_year')}
                >
                    Bu Yıl
                </button>

                <div className="custom-date-inputs">
                    <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => {
                            setCustomDateRange({ ...customDateRange, start: e.target.value });
                            setDateFilter('custom');
                        }}
                    />
                    <span>-</span>
                    <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => {
                            setCustomDateRange({ ...customDateRange, end: e.target.value });
                            setDateFilter('custom');
                        }}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="finance-summary">
                <div className="summary-card income">
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                        <h3>Toplam Gelir</h3>
                        <p className="amount">€{summary.totalIncome.toFixed(2)}</p>
                        <span className="count">{summary.incomeCount} kayıt</span>
                    </div>
                </div>

                <div className="summary-card expense">
                    <div className="card-icon">📉</div>
                    <div className="card-content">
                        <h3>Toplam Gider</h3>
                        <p className="amount">€{summary.totalExpenses.toFixed(2)}</p>
                        <span className="count">{summary.expenseCount} kayıt</span>
                    </div>
                </div>

                <div className={`summary-card profit ${summary.netProfit >= 0 ? 'positive' : 'negative'}`}>
                    <div className="card-icon">{summary.netProfit >= 0 ? '💰' : '⚠️'}</div>
                    <div className="card-content">
                        <h3>Net Kar/Zarar</h3>
                        <p className="amount">€{summary.netProfit.toFixed(2)}</p>
                        <span className="count">{summary.netProfit >= 0 ? 'Kar' : 'Zarar'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="finance-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Genel Bakış
                </button>
                <button
                    className={activeTab === 'charts' ? 'active' : ''}
                    onClick={() => setActiveTab('charts')}
                >
                    📈 Grafikler
                </button>
                <button
                    className={activeTab === 'income' ? 'active' : ''}
                    onClick={() => setActiveTab('income')}
                >
                    📥 Gelirler ({filteredIncome.length})
                </button>
                <button
                    className={activeTab === 'expenses' ? 'active' : ''}
                    onClick={() => setActiveTab('expenses')}
                >
                    📤 Giderler ({filteredExpenses.length})
                </button>
                <button
                    className={activeTab === 'recurring' ? 'active' : ''}
                    onClick={() => setActiveTab('recurring')}
                >
                    🔄 Düzenli Giderler ({recurringExpenses.length})
                </button>
                <button
                    className={activeTab === 'recurring_income' ? 'active' : ''}
                    onClick={() => setActiveTab('recurring_income')}
                >
                    💚 Düzenli Gelirler ({recurringIncome.length})
                </button>
                <button
                    className={activeTab === 'budget' ? 'active' : ''}
                    onClick={() => setActiveTab('budget')}
                >
                    🎯 Bütçe Hedefleri ({budgetTargets.length})
                </button>
            </div>

            {/* Content */}
            <div className="finance-content">
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <h2>Son İşlemler</h2>
                        <div className="recent-transactions">
                            {[...filteredIncome.slice(0, 5), ...filteredExpenses.slice(0, 5)]
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 10)
                                .map(record => (
                                    <div key={record.id} className="transaction-item">
                                        <span className="date">{new Date(record.date).toLocaleDateString('tr-TR')}</span>
                                        <span className="description">{record.description || record.category}</span>
                                        <span className={`amount ${record.category ? 'income' : 'expense'}`}>
                                            {allIncomeRecords.find(r => r.id === record.id) ? '+' : '-'}€{parseFloat(record.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            {filteredIncome.length === 0 && filteredExpenses.length === 0 && (
                                <div className="no-data">Bu tarih aralığında işlem bulunamadı.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'charts' && (
                    <div className="charts-content">
                        <div className="chart-container">
                            <h3>Gelir Dağılımı (Kategori)</h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={incomeChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {incomeChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-container">
                            <h3>Gider Dağılımı (Kategori)</h3>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={expenseChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="value" fill="#FF8042" name="Tutar" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'income' && (
                    <div className="income-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Kategori</th>
                                    <th>Açıklama</th>
                                    <th>Ödeme Yöntemi</th>
                                    <th>Tutar</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncome.map(record => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString('tr-TR')}</td>
                                        <td><span className="category-badge">{record.category}</span></td>
                                        <td>{record.description}</td>
                                        <td>{record.payment_method}</td>
                                        <td className="amount-cell">€{parseFloat(record.amount).toFixed(2)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditIncome(record)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteIncome(record.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="expense-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Kategori</th>
                                    <th>Açıklama</th>
                                    <th>Satıcı</th>
                                    <th>Tutar</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(record => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString('tr-TR')}</td>
                                        <td><span className="category-badge">{record.category}</span></td>
                                        <td>{record.description}</td>
                                        <td>{record.vendor_name}</td>
                                        <td className="amount-cell">€{parseFloat(record.amount).toFixed(2)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditExpense(record)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteExpense(record.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'recurring' && (
                    <div className="recurring-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ödeme Günü</th>
                                    <th>Kategori</th>
                                    <th>Açıklama</th>
                                    <th>Tutar</th>
                                    <th>Son İşlem</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringExpenses.map(record => (
                                    <tr key={record.id} className={!record.active ? 'inactive-row' : ''}>
                                        <td>Her ayın {record.day_of_month}. günü</td>
                                        <td><span className="category-badge">{record.category}</span></td>
                                        <td>{record.description}</td>
                                        <td className="amount-cell">€{parseFloat(record.amount).toFixed(2)}</td>
                                        <td>{record.last_generated_date ? new Date(record.last_generated_date).toLocaleDateString('tr-TR') : '-'}</td>
                                        <td>
                                            <span className={`status-badge ${record.active ? 'active' : 'inactive'}`}>
                                                {record.active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className={`btn-toggle ${record.active ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => toggleRecurringStatus(record.id, record.active)}
                                                    title={record.active ? 'Durdur' : 'Başlat'}
                                                >
                                                    {record.active ? '⏸️' : '▶️'}
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditRecurring(record)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteRecurringExpense(record.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recurringExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center">Henüz düzenli gider tanımlanmamış.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'recurring_income' && (
                    <div className="recurring-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ödeme Günü</th>
                                    <th>Kategori</th>
                                    <th>Açıklama</th>
                                    <th>Tutar</th>
                                    <th>Son İşlem</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringIncome.map(record => (
                                    <tr key={record.id} className={!record.active ? 'inactive-row' : ''}>
                                        <td>Her ayın {record.day_of_month}. günü</td>
                                        <td><span className="category-badge">{record.category}</span></td>
                                        <td>{record.description}</td>
                                        <td className="amount-cell">€{parseFloat(record.amount).toFixed(2)}</td>
                                        <td>{record.last_generated_date ? new Date(record.last_generated_date).toLocaleDateString('tr-TR') : '-'}</td>
                                        <td>
                                            <span className={`status-badge ${record.active ? 'active' : 'inactive'}`}>
                                                {record.active ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className={`btn-toggle ${record.active ? 'btn-warning' : 'btn-success'}`}
                                                    onClick={() => toggleRecurringIncomeStatus(record.id, record.active)}
                                                    title={record.active ? 'Durdur' : 'Başlat'}
                                                >
                                                    {record.active ? '⏸️' : '▶️'}
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditRecurringIncome(record)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteRecurringIncome(record.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recurringIncome.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center">Henüz düzenli gelir tanımlanmamış.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'budget' && (
                    <div className="budget-content">
                        <div className="budget-header">
                            <div className="budget-period-selector">
                                <select
                                    value={selectedBudgetMonth}
                                    onChange={(e) => {
                                        setSelectedBudgetMonth(parseInt(e.target.value));
                                        setTimeout(() => fetchFinanceData(), 100);
                                    }}
                                >
                                    <option value="1">Ocak</option>
                                    <option value="2">Şubat</option>
                                    <option value="3">Mart</option>
                                    <option value="4">Nisan</option>
                                    <option value="5">Mayıs</option>
                                    <option value="6">Haziran</option>
                                    <option value="7">Temmuz</option>
                                    <option value="8">Ağustos</option>
                                    <option value="9">Eylül</option>
                                    <option value="10">Ekim</option>
                                    <option value="11">Kasım</option>
                                    <option value="12">Aralık</option>
                                </select>
                                <select
                                    value={selectedBudgetYear}
                                    onChange={(e) => {
                                        setSelectedBudgetYear(parseInt(e.target.value));
                                        setTimeout(() => fetchFinanceData(), 100);
                                    }}
                                >
                                    {[2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setEditingId(null);
                                        resetBudgetForm();
                                        setShowBudgetForm(true);
                                    }}
                                >
                                    + Bütçe Hedefi Ekle
                                </button>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Kategori</th>
                                    <th>Tip</th>
                                    <th>Hedef</th>
                                    <th>Gerçekleşen</th>
                                    <th>Durum</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetTargets.map(budget => (
                                    <tr key={budget.id} className={budget.is_exceeded ? 'budget-exceeded' : ''}>
                                        <td><span className="category-badge">{budget.category}</span></td>
                                        <td>{budget.target_type === 'income' ? 'Gelir' : 'Gider'}</td>
                                        <td className="amount-cell">€{parseFloat(budget.monthly_limit).toFixed(2)}</td>
                                        <td className="amount-cell">€{parseFloat(budget.actual_amount).toFixed(2)}</td>
                                        <td>
                                            <div className="budget-progress">
                                                <div className="progress-bar-container">
                                                    <div
                                                        className={`progress-bar ${budget.is_exceeded ? 'exceeded' : ''}`}
                                                        style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`percentage ${budget.is_exceeded ? 'exceeded' : ''}`}>
                                                    {budget.percentage_used.toFixed(0)}%
                                                    {budget.is_exceeded && ' ⚠️'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openEditBudget(budget)}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => deleteBudget(budget.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {budgetTargets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center">Bu ay için bütçe hedefi tanımlanmamış.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Income Form Modal */}
            {showIncomeForm && (
                <div className="modal-overlay" onClick={() => setShowIncomeForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Gelir Düzenle' : 'Gelir Ekle'}</h2>
                        <form onSubmit={handleIncomeSubmit}>
                            <div className="form-group">
                                <label>Tarih</label>
                                <input
                                    type="date"
                                    value={incomeForm.date}
                                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={incomeForm.category}
                                    onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                                >
                                    <option value="subscription">Abonelik</option>
                                    <option value="credits">Kredi Satışı</option>
                                    <option value="ads">Reklam</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tutar (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={incomeForm.amount}
                                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea
                                    value={incomeForm.description}
                                    onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ödeme Yöntemi</label>
                                <select
                                    value={incomeForm.payment_method}
                                    onChange={(e) => setIncomeForm({ ...incomeForm, payment_method: e.target.value })}
                                >
                                    <option value="paypal">PayPal</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="bank_transfer">Banka Transferi</option>
                                    <option value="cash">Nakit</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowIncomeForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Form Modal */}
            {showExpenseForm && (
                <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Gider Düzenle' : 'Gider Ekle'}</h2>
                        <form onSubmit={handleExpenseSubmit}>
                            <div className="form-group">
                                <label>Tarih</label>
                                <input
                                    type="date"
                                    value={expenseForm.date}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={expenseForm.category}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                >
                                    <option value="hosting">Hosting/Sunucu</option>
                                    <option value="marketing">Pazarlama</option>
                                    <option value="salary">Maaş</option>
                                    <option value="software">Yazılım Lisansı</option>
                                    <option value="tax">Vergi</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tutar (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Açıklama *</label>
                                <textarea
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Satıcı/Firma</label>
                                <input
                                    type="text"
                                    value={expenseForm.vendor_name}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={expenseForm.is_tax_deductible}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, is_tax_deductible: e.target.checked })}
                                    />
                                    Vergiden düşülebilir
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recurring Expense Form Modal */}
            {showRecurringForm && (
                <div className="modal-overlay" onClick={() => setShowRecurringForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Düzenli Gider Düzenle' : 'Düzenli Gider Ekle'}</h2>
                        <form onSubmit={handleRecurringSubmit}>
                            <div className="form-group">
                                <label>Ödeme Günü (Ayın kaçı?)</label>
                                <select
                                    value={recurringForm.day_of_month}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, day_of_month: e.target.value })}
                                    required
                                >
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={recurringForm.category}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                                >
                                    <option value="hosting">Hosting/Sunucu</option>
                                    <option value="marketing">Pazarlama</option>
                                    <option value="salary">Maaş</option>
                                    <option value="software">Yazılım Lisansı</option>
                                    <option value="tax">Vergi</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tutar (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={recurringForm.amount}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Açıklama *</label>
                                <textarea
                                    value={recurringForm.description}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Satıcı/Firma</label>
                                <input
                                    type="text"
                                    value={recurringForm.vendor_name}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, vendor_name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ödeme Yöntemi</label>
                                <select
                                    value={recurringForm.payment_method}
                                    onChange={(e) => setRecurringForm({ ...recurringForm, payment_method: e.target.value })}
                                >
                                    <option value="bank_transfer">Banka Transferi</option>
                                    <option value="credit_card">Kredi Kartı</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="direct_debit">Otomatik Ödeme</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={recurringForm.active}
                                        onChange={(e) => setRecurringForm({ ...recurringForm, active: e.target.checked })}
                                    />
                                    Aktif
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRecurringForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Budget Form Modal */}
            {showBudgetForm && (
                <div className="modal-overlay" onClick={() => setShowBudgetForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Bütçe Hedefi Düzenle' : 'Bütçe Hedefi Ekle'}</h2>
                        <form onSubmit={handleBudgetSubmit}>
                            <div className="form-group">
                                <label>Tip</label>
                                <select
                                    value={budgetForm.target_type}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, target_type: e.target.value })}
                                >
                                    <option value="expense">Gider</option>
                                    <option value="income">Gelir</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={budgetForm.category}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                                >
                                    {budgetForm.target_type === 'expense' ? (
                                        <>
                                            <option value="hosting">Hosting/Sunucu</option>
                                            <option value="marketing">Pazarlama</option>
                                            <option value="salary">Maaş</option>
                                            <option value="software">Yazılım Lisansı</option>
                                            <option value="tax">Vergi</option>
                                            <option value="other">Diğer</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="subscription">Abonelik</option>
                                            <option value="credits">Kredi Satışı</option>
                                            <option value="ads">Reklam</option>
                                            <option value="commission">Komisyon</option>
                                            <option value="other">Diğer</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Aylık Limit (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={budgetForm.monthly_limit}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, monthly_limit: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Notlar</label>
                                <textarea
                                    value={budgetForm.notes}
                                    onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBudgetForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recurring Income Form Modal */}
            {showRecurringIncomeForm && (
                <div className="modal-overlay" onClick={() => setShowRecurringIncomeForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingId ? 'Düzenli Gelir Düzenle' : 'Düzenli Gelir Ekle'}</h2>
                        <form onSubmit={handleRecurringIncomeSubmit}>
                            <div className="form-group">
                                <label>Ödeme Günü (Ayın kaçı?)</label>
                                <select
                                    value={recurringIncomeForm.day_of_month}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, day_of_month: e.target.value })}
                                    required
                                >
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select
                                    value={recurringIncomeForm.category}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, category: e.target.value })}
                                >
                                    <option value="subscription">Abonelik</option>
                                    <option value="credits">Kredi Satışı</option>
                                    <option value="ads">Reklam</option>
                                    <option value="commission">Komisyon</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tutar (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={recurringIncomeForm.amount}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Açıklama *</label>
                                <textarea
                                    value={recurringIncomeForm.description}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, description: e.target.value })}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Kaynak/Müşteri</label>
                                <input
                                    type="text"
                                    value={recurringIncomeForm.source_name}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, source_name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ödeme Yöntemi</label>
                                <select
                                    value={recurringIncomeForm.payment_method}
                                    onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, payment_method: e.target.value })}
                                >
                                    <option value="paypal">PayPal</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="bank_transfer">Banka Transferi</option>
                                    <option value="direct_debit">Otomatik Ödeme</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={recurringIncomeForm.active}
                                        onChange={(e) => setRecurringIncomeForm({ ...recurringIncomeForm, active: e.target.checked })}
                                    />
                                    Aktif
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRecurringIncomeForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinance;
