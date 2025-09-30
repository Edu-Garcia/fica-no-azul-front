import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionsAPI, categoriesAPI } from '@/services/api';
import type { Transaction, Category } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [transactionsData, categoriesData] = await Promise.all([
          transactionsAPI.getAll(user.id),
          categoriesAPI.getAll(user.id)
        ]);
        
        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateBalance = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'receita' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  };

  const calculateIncome = () => {
    return transactions
      .filter(t => t.type === 'receita')
      .reduce((total, t) => total + t.amount, 0);
  };

  const calculateExpenses = () => {
    return transactions
      .filter(t => t.type === 'despesa')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const balance = calculateBalance();
  const income = calculateIncome();
  const expenses = calculateExpenses();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Saldo */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Atual
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
              </p>
            </CardContent>
          </Card>

          {/* Receitas */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(income)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de entradas
              </p>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">
                {formatCurrency(expenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de saídas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transações Recentes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Transações Recentes
          </CardTitle>
          <CardDescription>
            Suas últimas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm mt-1">Comece adicionando suas primeiras movimentações</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category_id);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'receita' ? 'bg-success-light' : 'bg-danger-light'
                      }`}>
                        {transaction.type === 'receita' ? (
                          <ArrowUpIcon className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-danger" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {category?.name || 'Categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'receita' ? 'text-success' : 'text-danger'
                    }`}>
                      {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;