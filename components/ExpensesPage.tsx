import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Expense, Partner, Category, PaymentStatus, Currency, ExpenseFormData } from '../types';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { Modal } from './ui/Modal';
import { Card } from './ui/Card';
import { PlusIcon, EditIcon, DeleteIcon, DuplicateIcon } from './icons/Icons';
import { CURRENCY_OPTIONS, PAYMENT_METHODS, PAYMENT_STATUS_OPTIONS, getMonthAndYearFromDate } from '../constants';
import { ExpenseForm, initialExpenseFormData } from './ExpenseForm';
import { v4 as uuidv4 } from 'uuid';


export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, getCategoryNameById, getPartnerNameById, categories, partners } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | ExpenseFormData | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFixedCharge, setFilterFixedCharge] = useState<'any' | 'yes' | 'no'>('any');
  const [filterDateRange, setFilterDateRange] = useState<{start: string, end: string}>({start: '', end: ''});

  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'ascending' | 'descending' } | null>(null);

  const openModalForNew = () => {
    setExpenseToEdit(null); 
    setFormMode('add');
    setIsModalOpen(true);
  };

  const openModalForEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setFormMode('edit');
    setIsModalOpen(true);
  };
  
  const openModalForDuplicate = (expense: Expense) => {
    const { id, month, year, entryTimestamp, ...duplicatableData } = expense;
    const newExpenseData: ExpenseFormData = {
        ...initialExpenseFormData, 
        ...duplicatableData,      
        date: new Date().toISOString().split('T')[0], 
        description: `Copy of ${expense.description}`,
    };
    setExpenseToEdit(newExpenseData);
    setFormMode('duplicate');
    setIsModalOpen(true);
  };


  const handleSaveExpense = (data: Expense | Omit<Expense, 'id'|'month'|'year'|'entryTimestamp'>) => {
    if ('id' in data && data.id) { 
      updateExpense(data as Expense);
    } else { 
      addExpense(data as Omit<Expense, 'id'|'month'|'year'|'entryTimestamp'>);
    }
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  const confirmDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
    }
    setIsDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter(exp => 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.provider && exp.provider.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterCategory) {
      filtered = filtered.filter(exp => exp.categoryId === filterCategory);
    }
    if (filterPartner) {
      filtered = filtered.filter(exp => exp.paidByPartnerId === filterPartner);
    }
    if (filterStatus) {
      filtered = filtered.filter(exp => exp.paymentStatus === filterStatus);
    }
    if (filterFixedCharge !== 'any') {
      filtered = filtered.filter(exp => exp.isFixedCharge === (filterFixedCharge === 'yes'));
    }
    if (filterDateRange.start) {
        filtered = filtered.filter(exp => exp.date >= filterDateRange.start);
    }
    if (filterDateRange.end) {
        filtered = filtered.filter(exp => exp.date <= filterDateRange.end);
    }


    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'amount' || sortConfig.key === 'year' || sortConfig.key === 'itemCount') {
             const valA = a[sortConfig.key] as number | undefined;
             const valB = b[sortConfig.key] as number | undefined;
             if (valA === undefined && valB === undefined) return 0;
             if (valA === undefined) return 1; 
             if (valB === undefined) return -1;
             if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
             if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
             return 0;
        }
        const valA = String(a[sortConfig.key] || '').toLowerCase();
        const valB = String(b[sortConfig.key] || '').toLowerCase();

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by date descending (newest first)
      filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return filtered;
  }, [expenses, searchTerm, filterCategory, filterPartner, filterStatus, filterFixedCharge, filterDateRange, sortConfig]);

  const requestSort = (key: keyof Expense) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Expense) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const formatCurrencyDisplay = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Manage Expenses</h2>
        <Button onClick={openModalForNew} variant="primary" size="md">
          <PlusIcon className="h-5 w-5 mr-2" /> Add Expense
        </Button>
      </div>

      <Card title="Filters & Search">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Input placeholder="Search description, provider..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </Select>
          <Select value={filterPartner} onChange={e => setFilterPartner(e.target.value)}>
            <option value="">All Partners</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {PAYMENT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
          </Select>
           <Select value={filterFixedCharge} onChange={e => setFilterFixedCharge(e.target.value as 'any'|'yes'|'no')}>
            <option value="any">Any Type (Recurring/One-Time)</option>
            <option value="yes">Recurring Only</option>
            <option value="no">One-Time Only</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input type="date" label="Start Date" value={filterDateRange.start} onChange={e => setFilterDateRange(prev => ({...prev, start: e.target.value}))} />
             <Input type="date" label="End Date" value={filterDateRange.end} onChange={e => setFilterDateRange(prev => ({...prev, end: e.target.value}))} />
        </div>
      </Card>

      <Card bodyClassName="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Date', 'Description', 'Category', 'Amount', 'Type', 'Status', 'Paid By', 'Actions'].map((header) => {
                    let key: keyof Expense | null = null;
                    if (header === 'Date') key = 'date';
                    if (header === 'Description') key = 'description';
                    if (header === 'Category') key = 'categoryId';
                    if (header === 'Amount') key = 'amount';
                    if (header === 'Type') key = 'isFixedCharge';
                    if (header === 'Status') key = 'paymentStatus';

                    return (
                        <th key={header} scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => key && requestSort(key)}
                        >
                            {header} {key && getSortIndicator(key)}
                        </th>
                    );
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{expense.date} ({expense.month} {expense.year})</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{expense.description}</div>
                    {expense.provider && <div className="text-xs text-gray-500 dark:text-gray-400">{expense.provider}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{getCategoryNameById(expense.categoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrencyDisplay(expense.amount, expense.currency)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {expense.isFixedCharge ? 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-700 dark:text-sky-100">Recurring</span> : 
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100">One-Time</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expense.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                        expense.paymentStatus === PaymentStatus.DUE ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                        expense.paymentStatus === PaymentStatus.OVERDUE ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                    }`}>
                        {expense.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{getPartnerNameById(expense.paidByPartnerId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openModalForDuplicate(expense)} title="Duplicate">
                      <DuplicateIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400"/>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openModalForEdit(expense)} title="Edit">
                      <EditIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(expense)} title="Delete">
                      <DeleteIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedExpenses.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No expenses match your filters.</p>
          )}
      </Card>

      {isModalOpen && (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setExpenseToEdit(null); }} 
            title={formMode === 'edit' ? "Edit Expense" : (formMode === 'duplicate' ? "Duplicate Expense" : "Add New Expense")}
        >
          <ExpenseForm 
            expenseToEdit={expenseToEdit} 
            onClose={() => { setIsModalOpen(false); setExpenseToEdit(null); }} 
            onSave={handleSaveExpense}
            formMode={formMode}
          />
        </Modal>
      )}

      {isDeleteConfirmOpen && expenseToDelete && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p>Are you sure you want to delete the expense: "{expenseToDelete.description}"?</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};