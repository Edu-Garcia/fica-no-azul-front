import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { metasAPI } from '@/services/api';
import type { Meta } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Meta | null>(null);

  // Form state
  const [createFormData, setCreateFormData] = useState({
    description: '',
    target_amount: '',
    deadline: '',
    kind: ''
  });

  const [depositAmount, setDepositAmount] = useState('');

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const goalsData = await metasAPI.getAll(user.id);
      setGoals(goalsData);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newGoal = await metasAPI.create({
        user_id: user.id,
        description: createFormData.description,
        target_amount: parseFloat(createFormData.target_amount),
        deadline: createFormData.deadline,
        kind: createFormData.kind
      });

      setGoals(prev => [...prev, newGoal]);
      setIsCreateDialogOpen(false);
      setCreateFormData({
        description: '',
        target_amount: '',
        deadline: '',
        kind: ''
      });

      toast({
        title: "Sucesso!",
        description: "Meta criada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta.",
        variant: "destructive",
      });
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await metasAPI.deposit(selectedGoal.id, parseFloat(depositAmount));
      
      // Atualizar a meta localmente
      setGoals(prev => prev.map(goal => 
        goal.id === selectedGoal.id 
          ? { ...goal, current_amount: goal.current_amount + parseFloat(depositAmount) }
          : goal
      ));

      setIsDepositDialogOpen(false);
      setDepositAmount('');
      setSelectedGoal(null);

      toast({
        title: "Sucesso!",
        description: "Depósito realizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o depósito.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Metas Financeiras</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
              <DialogDescription>
                Defina um objetivo financeiro para alcançar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Viagem para Europa"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target_amount" className="text-right">Valor</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={createFormData.target_amount}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={createFormData.deadline}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kind" className="text-right">Tipo</Label>
                  <Input
                    id="kind"
                    placeholder="Ex: Lazer, Educação, Emergência"
                    value={createFormData.kind}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, kind: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="warning">
                  Criar Meta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma meta criada</h3>
            <p className="text-muted-foreground mb-4">
              Defina seus objetivos financeiros e acompanhe seu progresso
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = progress >= 100;
            const isOverdue = daysRemaining < 0;

            return (
              <Card key={goal.id} className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-warning" />
                    {goal.description}
                  </CardTitle>
                  <CardDescription>
                    {goal.kind}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.current_amount)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`${isOverdue ? 'text-danger' : 'text-muted-foreground'}`}>
                        {isOverdue 
                          ? `${Math.abs(daysRemaining)} dias em atraso`
                          : isCompleted
                          ? 'Meta concluída!'
                          : `${daysRemaining} dias restantes`
                        }
                      </span>
                    </div>
                  </div>

                  {!isCompleted && (
                    <Button 
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsDepositDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2"
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4" />
                      Fazer Depósito
                    </Button>
                  )}

                  {isCompleted && (
                    <div className="text-center p-3 rounded-lg bg-success-light border border-success/20">
                      <span className="text-success font-medium">🎉 Meta Alcançada!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Depósito */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fazer Depósito</DialogTitle>
            <DialogDescription>
              Adicionar valor à meta: {selectedGoal?.description}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDepositSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deposit_amount" className="text-right">Valor</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              {selectedGoal && (
                <div className="col-span-4 p-3 rounded-lg bg-accent text-sm">
                  <p className="text-muted-foreground">Meta atual:</p>
                  <p className="font-medium">
                    {formatCurrency(selectedGoal.current_amount)} de {formatCurrency(selectedGoal.target_amount)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" variant="success">
                Confirmar Depósito
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;