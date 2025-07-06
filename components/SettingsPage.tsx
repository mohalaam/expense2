
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Partner, Category } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Card } from './ui/Card';
import { PlusIcon, EditIcon, DeleteIcon } from './icons/Icons';

// Partner Manager Component
const PartnerManager: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner> | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const openModalForNew = () => {
    setCurrentPartner({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (partner: Partner) => {
    setCurrentPartner(partner);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentPartner || !currentPartner.name?.trim()) {
        alert("Partner name is required."); // Simple validation
        return;
    }
    if (currentPartner.id) {
      updatePartner(currentPartner as Partner);
    } else {
      addPartner({ name: currentPartner.name, email: currentPartner.email, role: currentPartner.role });
    }
    setIsModalOpen(false);
    setCurrentPartner(null);
  };
  
  const confirmDelete = (partner: Partner) => {
    setPartnerToDelete(partner);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (partnerToDelete) {
      deletePartner(partnerToDelete.id);
    }
    setIsDeleteConfirmOpen(false);
    setPartnerToDelete(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentPartner) {
      setCurrentPartner({ ...currentPartner, [e.target.name]: e.target.value });
    }
  };

  return (
    <Card title="Manage Partners">
      <Button onClick={openModalForNew} variant="primary" size="sm" className="mb-4">
        <PlusIcon className="h-4 w-4 mr-2" /> Add Partner
      </Button>
      <ul className="space-y-2">
        {partners.map(partner => (
          <li key={partner.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm">
            <div>
              <p className="font-medium text-gray-800">{partner.name}</p>
              {partner.email && <p className="text-sm text-gray-600">{partner.email}</p>}
              {partner.role && <p className="text-sm text-gray-500 italic">{partner.role}</p>}
            </div>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={() => openModalForEdit(partner)}><EditIcon className="h-4 w-4 text-blue-600" /></Button>
              <Button variant="ghost" size="sm" onClick={() => confirmDelete(partner)}><DeleteIcon className="h-4 w-4 text-red-600" /></Button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && currentPartner && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPartner.id ? "Edit Partner" : "Add Partner"}>
          <div className="space-y-4">
            <Input label="Partner Name" name="name" value={currentPartner.name || ''} onChange={handleChange} required />
            <Input label="Email (Optional)" name="email" type="email" value={currentPartner.email || ''} onChange={handleChange} />
            <Input label="Role (Optional)" name="role" value={currentPartner.role || ''} onChange={handleChange} />
          </div>
           <div className="flex justify-end space-x-3 pt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Partner</Button>
          </div>
        </Modal>
      )}
      
      {isDeleteConfirmOpen && partnerToDelete && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p>Are you sure you want to delete partner "{partnerToDelete.name}"?</p>
          <p className="text-sm text-gray-600">Expenses previously assigned to this partner may become unassigned or reassigned.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};


// Category Manager Component
const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  const openModalForNew = () => {
    setCurrentCategory({ defaultIsFixed: false }); // Default for new category
    setIsModalOpen(true);
  };

  const openModalForEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentCategory || !currentCategory.name?.trim()) {
        alert("Category name is required.");
        return;
    }
    if (currentCategory.id) {
      updateCategory(currentCategory as Category);
    } else {
      addCategory({ name: currentCategory.name, defaultIsFixed: currentCategory.defaultIsFixed || false });
    }
    setIsModalOpen(false);
    setCurrentCategory(null);
  };
  
  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
    }
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCategory) {
      const { name, value, type, checked } = e.target;
      setCurrentCategory({ 
          ...currentCategory, 
          [name]: type === 'checkbox' ? checked : value 
      });
    }
  };

  return (
    <Card title="Manage Expense Categories">
      <Button onClick={openModalForNew} variant="primary" size="sm" className="mb-4">
        <PlusIcon className="h-4 w-4 mr-2" /> Add Category
      </Button>
      <ul className="space-y-2">
        {categories.map(category => (
          <li key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm">
            <div>
                <p className="font-medium text-gray-800">{category.name}</p>
                {category.defaultIsFixed && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Defaults to Fixed</span>}
            </div>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={() => openModalForEdit(category)}><EditIcon className="h-4 w-4 text-blue-600" /></Button>
              <Button variant="ghost" size="sm" onClick={() => confirmDelete(category)}><DeleteIcon className="h-4 w-4 text-red-600" /></Button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && currentCategory && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCategory.id ? "Edit Category" : "Add Category"}>
          <div className="space-y-4">
            <Input label="Category Name" name="name" value={currentCategory.name || ''} onChange={handleChange} required />
            <div className="flex items-center">
                <input type="checkbox" id="defaultIsFixed" name="defaultIsFixed" checked={currentCategory.defaultIsFixed || false} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="defaultIsFixed" className="ml-2 block text-sm text-gray-900">Default new expenses in this category as Fixed Charge?</label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Category</Button>
          </div>
        </Modal>
      )}
      {isDeleteConfirmOpen && categoryToDelete && (
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p>Are you sure you want to delete category "{categoryToDelete.name}"?</p>
          <p className="text-sm text-gray-600">Expenses in this category may be reassigned to 'Miscellaneous' or become uncategorized.</p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};


export const SettingsPage: React.FC = () => {
  // Could add default currency settings here in the future
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PartnerManager />
        <CategoryManager />
      </div>
       <Card title="Application Configuration (Future)">
          <p className="text-gray-600">Future settings like default currency, notification preferences, etc., will appear here.</p>
       </Card>
    </div>
  );
};
