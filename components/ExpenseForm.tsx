import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Expense, Category, PaymentStatus, Currency, ExpenseFormData } from '../types';
import { Button } from './ui/Button';
import { Input, TextArea } from './ui/Input';
import { Select } from './ui/Select';
import { CURRENCY_OPTIONS, PAYMENT_METHODS, PAYMENT_STATUS_OPTIONS } from '../constants';

// Initial form data, used when creating a new expense.
// Default currency is MAD, default isFixedCharge is false.
export const initialExpenseFormData: ExpenseFormData = {
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
  description: '',
  amount: 0,
  currency: Currency.MAD,
  paymentStatus: PaymentStatus.DUE,
  isFixedCharge: false,
  provider: '',
  itemCount: undefined,
  paidByPartnerId: undefined,
  paymentMethod: undefined,
  notes: '',
};

interface ExpenseFormProps {
  expenseToEdit?: Expense | ExpenseFormData | null; // Can be a full Expense or just form data (e.g. for duplication)
  onClose: () => void;
  onSave: (expenseData: Expense | Omit<Expense, 'id' | 'month' | 'year' | 'entryTimestamp'>) => void;
  formMode?: 'add' | 'edit' | 'duplicate'; // Optional: to slightly adjust behavior if needed
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenseToEdit,
  onClose,
  onSave,
  formMode = 'add'
}) => {
  const { categories, partners } = useAppContext();
  const [formData, setFormData] = useState<ExpenseFormData>(initialExpenseFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  useEffect(() => {
    if (expenseToEdit) {
      // If it's a full Expense object, strip non-form fields
      if ('id' in expenseToEdit) {
        const { id, month, year, entryTimestamp, receiptAttachment, ...editableData } = expenseToEdit as Expense;
        setFormData({
          ...initialExpenseFormData, // Start with defaults to ensure all fields are present
          ...editableData,
          amount: Number(editableData.amount) || 0,
          itemCount: editableData.itemCount ? Number(editableData.itemCount) : undefined,
        });
      } else { // It's already ExpenseFormData (likely for duplication)
        setFormData({
            ...initialExpenseFormData,
            ...(expenseToEdit as ExpenseFormData),
            amount: Number(expenseToEdit.amount) || 0,
            itemCount: expenseToEdit.itemCount ? Number(expenseToEdit.itemCount) : undefined,
        });
      }
    } else {
      setFormData(initialExpenseFormData);
    }
  }, [expenseToEdit]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ExpenseFormData, string>> = {};
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.categoryId) errors.categoryId = "Category is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (formData.amount <= 0) errors.amount = "Amount must be greater than 0.";
    if (!formData.paymentStatus) errors.paymentStatus = "Payment status is required.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "categoryId" && value) {
        const selectedCategory = categories.find(c => c.id === value);
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            // Only update isFixedCharge if the category has a default AND we are not editing
            // or if it's a new form being filled.
            // For existing items, retain their current isFixedCharge unless manually changed by user.
            isFixedCharge: (formMode === 'add' || !expenseToEdit) && selectedCategory?.defaultIsFixed !== undefined 
                           ? selectedCategory.defaultIsFixed 
                           : prev.isFixedCharge,
        }));
    } else {
        setFormData(prev => ({ 
            ...prev, 
            [name]: (type === 'number' || name === 'amount' || name === 'itemCount') 
                    ? (value === '' ? undefined : parseFloat(value)) // Allow clearing number field
                    : value 
        }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const expenseDataToSave = {
      ...formData,
      amount: Number(formData.amount),
      itemCount: formData.itemCount ? Number(formData.itemCount) : undefined,
    };

    // If expenseToEdit has an 'id' and it's a full Expense, it's an update.
    if (expenseToEdit && 'id' in expenseToEdit && (expenseToEdit as Expense).id) {
      onSave({ ...(expenseToEdit as Expense), ...expenseDataToSave });
    } else { // New expense or duplicated one that doesn't have an ID yet
      onSave(expenseDataToSave as Omit<Expense, 'id'|'month'|'year'|'entryTimestamp'>);
    }
    onClose();
  };
  
  const isEditing = !!(expenseToEdit && 'id' in expenseToEdit && (expenseToEdit as Expense).id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} error={formErrors.date} required />
        <Select label="Category" name="categoryId" value={formData.categoryId} onChange={handleChange} error={formErrors.categoryId} required>
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </Select>
      </div>
      <Input label="Provider/Vendor" name="provider" value={formData.provider || ''} onChange={handleChange} />
      <TextArea label="Description" name="description" value={formData.description} onChange={handleChange} error={formErrors.description} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Amount" type="number" name="amount" value={formData.amount ?? ''} onChange={handleChange} error={formErrors.amount} step="0.01" required />
        <Select label="Currency" name="currency" value={formData.currency} onChange={handleChange}>
          {CURRENCY_OPTIONS.map(curr => <option key={curr} value={curr}>{curr}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input label="Item Count (Optional)" type="number" name="itemCount" value={formData.itemCount ?? ''} onChange={handleChange} min="0" />
         <Select label="Payment Status" name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} error={formErrors.paymentStatus} required>
          {PAYMENT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Paid By Partner (Optional)" name="paidByPartnerId" value={formData.paidByPartnerId || ''} onChange={handleChange}>
          <option value="">Select Partner</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select label="Payment Method (Optional)" name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange}>
          <option value="">Select Method</option>
          {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
        </Select>
      </div>
       <div className="flex items-center">
          <input type="checkbox" id="isFixedCharge" name="isFixedCharge" checked={formData.isFixedCharge} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <label htmlFor="isFixedCharge" className="ml-2 block text-sm text-gray-900">Is this a recurring monthly charge?</label>
      </div>
      <TextArea label="Notes (Optional)" name="notes" value={formData.notes || ''} onChange={handleChange} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Attachment (Optional)</label>
        <Input type="file" name="receiptAttachment" disabled className="opacity-50 cursor-not-allowed" title="File uploads not implemented in this demo" />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">
            {isEditing ? 'Save Changes' : (formMode === 'duplicate' ? 'Add Duplicated Expense' : 'Add Expense')}
        </Button>
      </div>
    </form>
  );
};
