import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Partner, Expense, Currency } from '../types';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Input } from './ui/Input'; // Added import
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const formatCurrency = (value: number, currency: Currency = Currency.USD): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
};

// Custom Tooltip for Recharts to handle dark mode (basic example)
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  const { theme } = useAppContext();
  if (active && payload && payload.length) {
    return (
      <div className={`p-2 rounded shadow-lg ${theme === 'dark' ? 'bg-gray-700 text-white border border-gray-600' : 'bg-white text-gray-800 border border-gray-300'}`}>
        <p className="label">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.fill || pld.stroke }}>{`${pld.name} : ${formatter ? formatter(pld.value, pld.name, pld) : pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};
// Custom Legend for Recharts to handle dark mode (basic example)
const renderLegend = (props: any) => {
  const { payload } = props;
  const { theme } = useAppContext();
  const textColor = theme === 'dark' ? '#A0AEC0' : '#4A5568'; // gray-400 for dark, gray-700 for light

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {
        payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ color: textColor, marginRight: 10, display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" style={{ marginRight: 4 }}>
              <rect width="14" height="14" style={{ fill: entry.color }} />
            </svg>
            {entry.value}
          </li>
        ))
      }
    </ul>
  );
};

export const PartnerContributionsPage: React.FC = () => {
  const { expenses, partners, categories, getCategoryNameById, theme } = useAppContext();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [filterCategory, setFilterCategory] = useState<string>('');


  const contributionsByPartner = useMemo(() => {
    const contributions: Record<string, { total: number; expenses: Expense[] }> = {};
    
    let filteredExpenses = expenses;
    if (filterDateRange.start) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date >= filterDateRange.start);
    }
    if (filterDateRange.end) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date <= filterDateRange.end);
    }
    if (filterCategory) {
        filteredExpenses = filteredExpenses.filter(exp => exp.categoryId === filterCategory);
    }


    partners.forEach(partner => {
      contributions[partner.id] = { total: 0, expenses: [] };
    });

    filteredExpenses.forEach(expense => {
      if (expense.paidByPartnerId) {
        if (!contributions[expense.paidByPartnerId]) {
            const foundPartner = partners.find(p => p.id === expense.paidByPartnerId);
            if (foundPartner) {
                 contributions[expense.paidByPartnerId] = { total: 0, expenses: [] };
            } else {
                return; 
            }
        }
        contributions[expense.paidByPartnerId].total += expense.amount;
        contributions[expense.paidByPartnerId].expenses.push(expense);
      }
    });
    return contributions;
  }, [expenses, partners, filterDateRange, filterCategory]);

  const chartData = useMemo(() => {
    return partners
      .map(partner => ({
        name: partner.name,
        totalContribution: contributionsByPartner[partner.id]?.total || 0,
      }))
      .filter(data => data.totalContribution > 0) 
      .sort((a, b) => b.totalContribution - a.totalContribution);
  }, [partners, contributionsByPartner]);

  const selectedPartnerDetails = useMemo(() => {
    if (!selectedPartnerId) return null;
    return contributionsByPartner[selectedPartnerId];
  }, [selectedPartnerId, contributionsByPartner]);

  const chartTextColor = theme === 'dark' ? '#CBD5E0' : '#4A5568';
  const chartGridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0';

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Partner Contributions</h2>

      <Card title="Filters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Filter by Category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Select>
            <Input type="date" label="Start Date" value={filterDateRange.start} onChange={e => setFilterDateRange(prev => ({...prev, start: e.target.value}))} title="Start Date"/>
            <Input type="date" label="End Date" value={filterDateRange.end} onChange={e => setFilterDateRange(prev => ({...prev, end: e.target.value}))} title="End Date"/>
          </div>
      </Card>
      
      <Card title="Contributions Overview">
        {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
            <XAxis dataKey="name" tick={{ fill: chartTextColor }}/>
            <YAxis tickFormatter={(value) => formatCurrency(value, Currency.USD).replace(Currency.USD, '')} tick={{ fill: chartTextColor }}/>
            <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
            <Legend content={renderLegend} />
            <Bar dataKey="totalContribution" fill="#8884d8" name="Total Contribution" />
          </BarChart>
        </ResponsiveContainer>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contribution data to display based on current filters.</p>}
      </Card>

      <Card title="Detailed Contributions by Partner">
        <div className="mb-4">
          <Select label="Select Partner to View Details" value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)}>
            <option value="">-- Select a Partner --</option>
            {partners.map(partner => (
              <option key={partner.id} value={partner.id}>{partner.name}</option>
            ))}
          </Select>
        </div>

        {selectedPartnerDetails && selectedPartnerId ? (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-2">
              {partners.find(p => p.id === selectedPartnerId)?.name} - Total: {formatCurrency(selectedPartnerDetails.total)}
            </h3>
            {selectedPartnerDetails.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedPartnerDetails.expenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{expense.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{getCategoryNameById(expense.categoryId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(expense.amount, expense.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No expenses recorded for this partner with current filters.</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Select a partner to see their detailed contributions.</p>
        )}
      </Card>
    </div>
  );
};