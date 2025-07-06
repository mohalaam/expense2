import React, { useMemo, useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Expense, Currency, ExpenseFormData } from '../types'; // Added ExpenseFormData
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { EditIcon, DeleteIcon } from './icons/Icons';
import { ExpenseForm } from './ExpenseForm'; // Import shared ExpenseForm

const formatCurrency = (value: number, currency: Currency = Currency.USD): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
};

export const FixedChargesPage: React.FC = () => {
  const { expenses, getCategoryNameById, getPartnerNameById, categories, updateExpense, deleteExpense } = useAppContext();
  const [filterCategory, setFilterCategory] = useState<string>('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // This page now shows one-time/lifetime purchases, so we filter for isFixedCharge: false
  const oneTimePurchases = useMemo(() => {
    return expenses.filter(exp => !exp.isFixedCharge && (!filterCategory || exp.categoryId === filterCategory));
  }, [expenses, filterCategory]);

  const totalOneTimePurchasesValue = useMemo(() => {
    return oneTimePurchases.reduce((sum, exp) => sum + exp.amount, 0);
  }, [oneTimePurchases]);

  const openEditModal = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsEditModalOpen(true);
  };

  const handleSaveExpense = (data: Expense | Omit<Expense, 'id'|'month'|'year'|'entryTimestamp'>) => {
    // On this page, we are only editing existing expenses.
    if ('id' in data && data.id) {
      updateExpense(data as Expense);
    }
    setIsEditModalOpen(false);
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


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Capital Expenditures / One-Time Purchases</h2>
      <p className="text-gray-600">This page lists significant one-time or lifetime purchases, not recurring monthly costs. You can edit or remove them using the action buttons.</p>

      <Card title="Summary of One-Time Purchases">
        <div className="mb-6">
            <p className="text-lg text-gray-700">Total Value of Listed One-Time Purchases:</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalOneTimePurchasesValue)}</p>
        </div>
         <Select 
            label="Filter by Category" 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)} 
            className="max-w-xs"
        >
            <option value="">All Categories</option>
            {categories
                .filter(c => oneTimePurchases.some(otp => otp.categoryId === c.id)) 
                .map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
            }
          </Select>
      </Card>

      <Card title="List of One-Time / Lifetime Purchases">
        {oneTimePurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {oneTimePurchases.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.description}
                        {expense.provider && <div className="text-xs text-gray-500">Provider: {expense.provider}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getCategoryNameById(expense.categoryId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(expense.amount, expense.currency)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getPartnerNameById(expense.paidByPartnerId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(expense)} title="Edit">
                            <EditIcon className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(expense)} title="Delete">
                            <DeleteIcon className="h-4 w-4 text-red-600" />
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 py-4 text-center">No one-time purchases recorded or matching current filters.</p>
        )}
      </Card>

      {isEditModalOpen && expenseToEdit && (
        <Modal 
            isOpen={isEditModalOpen} 
            onClose={() => { setIsEditModalOpen(false); setExpenseToEdit(null);}} 
            title="Edit One-Time Purchase"
        >
          <ExpenseForm 
            expenseToEdit={expenseToEdit} 
            onClose={() => { setIsEditModalOpen(false); setExpenseToEdit(null); }} 
            onSave={handleSaveExpense}
            formMode="edit"
          />
        </Modal>
      )}

      {isDeleteConfirmOpen && expenseToDelete && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p>Are you sure you want to delete this one-time purchase: "{expenseToDelete.description}"?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
