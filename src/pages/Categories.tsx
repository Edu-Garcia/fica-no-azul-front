import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { categoriesAPI } from '@/services/api';
import type { Category } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Tag, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Categories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'despesa' as 'receita' | 'despesa'
  });

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const categoriesData = await categoriesAPI.getAll(user.id);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newCategory = await categoriesAPI.create({
        name: formData.name,
        type: formData.type,
        user_id: user.id
      });

      setCategories(prev => [...prev, newCategory]);
      setIsDialogOpen(false);
      setFormData({
        name: '',
        type: 'despesa'
      });

      toast({
        title: "Sucesso!",
        description: "Categoria criada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'receita');
  const expenseCategories = categories.filter(c => c.type === 'despesa');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-muted rounded"></div>
                  ))}
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
        <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para organizar suas transações
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome da categoria"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant={formData.type === 'receita' ? 'success' : 'destructive'}>
                  Criar Categoria
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categorias de Receita */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <ArrowUpIcon className="h-5 w-5" />
              Receitas
            </CardTitle>
            <CardDescription>
              Categorias para suas entradas de dinheiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma categoria de receita</p>
                <p className="text-sm mt-1">Adicione categorias para organizar suas receitas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-success-light border border-success/20">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-success" />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                    <Badge variant="outline" className="border-success text-success">
                      Receita
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias de Despesa */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <ArrowDownIcon className="h-5 w-5" />
              Despesas
            </CardTitle>
            <CardDescription>
              Categorias para suas saídas de dinheiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma categoria de despesa</p>
                <p className="text-sm mt-1">Adicione categorias para organizar suas despesas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-danger-light border border-danger/20">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-danger" />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                    <Badge variant="outline" className="border-danger text-danger">
                      Despesa
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Resumo de Categorias</CardTitle>
          <CardDescription>
            Visão geral das suas categorias organizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-success-light">
              <div className="text-2xl font-bold text-success">{incomeCategories.length}</div>
              <p className="text-sm text-muted-foreground">Receitas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-danger-light">
              <div className="text-2xl font-bold text-danger">{expenseCategories.length}</div>
              <p className="text-sm text-muted-foreground">Despesas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent">
              <div className="text-2xl font-bold text-foreground">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary-light">
              <div className="text-2xl font-bold text-primary">
                {categories.length > 0 ? '✓' : '–'}
              </div>
              <p className="text-sm text-muted-foreground">Organizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;