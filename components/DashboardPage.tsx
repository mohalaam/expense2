
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { Expense, Currency } from '../types';
import { Card } from './ui/Card';
import { MONTH_NAMES_SHORT } from '../constants';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#FA8072', '#8A2BE2', '#DEB887', '#A52A2A'];

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


export const DashboardPage: React.FC = () => {
  const { expenses, categories, partners, getCategoryNameById, getPartnerNameById, theme } = useAppContext();

  // All const declarations below have been reviewed and appear to have initializers.
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  
  const currentMonth = MONTH_NAMES_SHORT[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  const expensesThisMonth = useMemo(() => 
    expenses
      .filter(exp => exp.month === currentMonth && exp.year === currentYear)
      .reduce((sum, exp) => sum + exp.amount, 0),
    [expenses, currentMonth, currentYear]
  );

  const expensesYTD = useMemo(() =>
    expenses
      .filter(exp => exp.year === currentYear)
      .reduce((sum, exp) => sum + exp.amount, 0),
    [expenses, currentYear]
  );

  const expensesByCategory = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    categories.forEach(category => {
      const categoryExpenses = expenses
        .filter(exp => exp.categoryId === category.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      if (categoryExpenses > 0) {
        data.push({ name: category.name, value: categoryExpenses });
      }
    });
    return data.sort((a,b) => b.value - a.value);
  }, [expenses, categories]);

  const expensesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${MONTH_NAMES_SHORT[d.getMonth()]}-${d.getFullYear()}`;
        monthlyData[monthKey] = 0;
    }

    expenses.forEach(exp => {
      const monthKey = `${exp.month}-${exp.year}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount;
    });
    
    return Object.entries(monthlyData)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => {
            const [aMonth, aYear] = a.name.split('-');
            const [bMonth, bYear] = b.name.split('-');
            const aDate = new Date(MONTH_NAMES_SHORT.indexOf(aMonth), 1, parseInt(aYear));
            const bDate = new Date(MONTH_NAMES_SHORT.indexOf(bMonth), 1, parseInt(bYear));
            return aDate.getTime() - bDate.getTime();
        })
        .slice(-12); 
  }, [expenses]);


  const partnerContributions = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    partners.forEach(partner => {
      const partnerExpenses = expenses
        .filter(exp => exp.paidByPartnerId === partner.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      if (partnerExpenses > 0) {
        data.push({ name: partner.name, value: partnerExpenses });
      }
    });
    return data.sort((a,b) => b.value - a.value);
  }, [expenses, partners]);

  const fixedVsVariable = useMemo(() => {
    const fixed = expenses.filter(e => e.isFixedCharge).reduce((sum, e) => sum + e.amount, 0);
    const variable = expenses.filter(e => !e.isFixedCharge).reduce((sum, e) => sum + e.amount, 0);
    return [
      { name: 'Fixed Costs', value: fixed },
      { name: 'Variable Costs', value: variable },
    ];
  }, [expenses]);

  const chartTextColor = theme === 'dark' ? '#CBD5E0' : '#4A5568'; 
  const chartGridColor = theme === 'dark' ? '#4A5568' : '#E2E8F0'; 


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Expenses (All Time)" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700">
          <p className="text-4xl font-bold">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card title={`Expenses (This Month - ${currentMonth} ${currentYear})`} className="bg-gradient-to-r from-green-500 to-green-600 text-white dark:from-green-600 dark:to-green-700">
          <p className="text-4xl font-bold">{formatCurrency(expensesThisMonth)}</p>
        </Card>
        <Card title={`Expenses (YTD - ${currentYear})`} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white dark:from-indigo-600 dark:to-indigo-700">
          <p className="text-4xl font-bold">{formatCurrency(expensesYTD)}</p>
        </Card>
         <Card title="Fixed vs Variable (All Time)" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white dark:from-purple-600 dark:to-purple-700">
          <p className="text-2xl font-semibold">Fixed: {formatCurrency(fixedVsVariable[0].value)}</p>
          <p className="text-2xl font-semibold">Variable: {formatCurrency(fixedVsVariable[1].value)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expenses by Category">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fill={chartTextColor}>
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400">No expense data for categories.</p>}
        </Card>

        <Card title="Partner Contributions">
          {partnerContributions.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partnerContributions} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} interval={0} tick={{ fill: chartTextColor }}/>
              <YAxis tickFormatter={(value) => formatCurrency(value, Currency.USD).replace(Currency.USD, '')} tick={{ fill: chartTextColor }}/>
              <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
              <Legend content={renderLegend} />
              <Bar dataKey="value" fill="#82ca9d" name="Total Contribution" />
            </BarChart>
          </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400">No partner contribution data.</p>}
        </Card>
      </div>
      
      <Card title="Expenses by Month (Last 12 Months)">
         {expensesByMonth.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expensesByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="name" tick={{ fill: chartTextColor }}/>
            <YAxis tickFormatter={(value) => formatCurrency(value, Currency.USD).replace(Currency.USD, '')} tick={{ fill: chartTextColor }}/>
            <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
            <Legend content={renderLegend} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Total Expenses" />
          </LineChart>
        </ResponsiveContainer>
         ) : <p className="text-gray-500 dark:text-gray-400">No monthly expense data.</p>}
      </Card>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Expenses (Last 10)">
          {expenses.length > 0 ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {expenses.slice(0, 10).map(exp => (
                <li key={exp.id} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-700 dark:text-gray-300">
                  <span>{exp.description} ({getCategoryNameById(exp.categoryId)})</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(exp.amount, exp.currency)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 dark:text-gray-400">No expenses logged yet.</p>}
        </Card>
        <Card title="Top Providers/Vendors by Spending">
           { (() => {
              const providerSpending = expenses.reduce((acc, exp) => {
                if (exp.provider) {
                  acc[exp.provider] = (acc[exp.provider] || 0) + exp.amount;
                }
                return acc;
              }, {} as Record<string, number>);
              const sortedProviders = Object.entries(providerSpending)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

              return sortedProviders.length > 0 ? (
                <ul className="space-y-2">
                  {sortedProviders.map(([provider, total]) => (
                    <li key={provider} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-700 dark:text-gray-300">
                      <span>{provider}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(total)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 dark:text-gray-400">No provider spending data.</p>;
           })()}
        </Card>
      </div>
    </div>
  );
};
