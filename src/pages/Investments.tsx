import { useState, useEffect } from 'react';
import { investmentsAPI } from '@/services/api';
import type { Investment } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const investmentsData = await investmentsAPI.getAll();
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os investimentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'baixo':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'médio':
      case 'medio':
        return <Shield className="h-4 w-4 text-warning" />;
      case 'alto':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'baixo':
        return 'outline' as const;
      case 'médio':
      case 'medio':
        return 'secondary' as const;
      case 'alto':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'baixo':
        return 'border-success text-success';
      case 'médio':
      case 'medio':
        return 'border-warning text-warning';
      case 'alto':
        return 'border-danger text-danger';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
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
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">Opções de Investimento</h2>
        <TrendingUp className="h-6 w-6 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{investments.filter(i => i.risk_level.toLowerCase() === 'baixo').length}</div>
            <p className="text-sm text-muted-foreground">Baixo Risco</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{investments.filter(i => i.risk_level.toLowerCase() === 'médio' || i.risk_level.toLowerCase() === 'medio').length}</div>
            <p className="text-sm text-muted-foreground">Médio Risco</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-danger">{investments.filter(i => i.risk_level.toLowerCase() === 'alto').length}</div>
            <p className="text-sm text-muted-foreground">Alto Risco</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{investments.length}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {investments.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum investimento disponível</h3>
            <p className="text-muted-foreground">
              As opções de investimento aparecerão aqui quando estiverem disponíveis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <Card key={investment.id} className="shadow-card hover:shadow-hover transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{investment.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {investment.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {getRiskIcon(investment.risk_level)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rentabilidade mensal</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">
                      {formatPercentage(investment.monthly_rate)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ao mês
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nível de risco</span>
                  <Badge 
                    variant={getRiskVariant(investment.risk_level)}
                    className={`${getRiskColor(investment.risk_level)} capitalize`}
                  >
                    {investment.risk_level}
                  </Badge>
                </div>

                {/* Informações adicionais */}
                <div className="pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Rentabilidade baseada em dados históricos</p>
                    <p>• Investimentos sujeitos a variações de mercado</p>
                    <p>• Consulte um especialista antes de investir</p>
                  </div>
                </div>

                {/* Simulação de retorno anual */}
                <div className="p-3 rounded-lg bg-accent/50 border">
                  <div className="text-xs text-muted-foreground mb-1">Simulação anual (R$ 1.000)</div>
                  <div className="font-medium text-foreground">
                    R$ {(1000 * Math.pow(1 + investment.monthly_rate, 12)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-success">
                    +R$ {((1000 * Math.pow(1 + investment.monthly_rate, 12)) - 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} de retorno
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <Card className="shadow-card border-warning/20 bg-warning-light">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Aviso Importante</p>
              <p className="text-muted-foreground">
                Os investimentos apresentados são apenas informativos. Rentabilidades passadas não garantem resultados futuros. 
                Consulte sempre um especialista financeiro antes de tomar decisões de investimento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;