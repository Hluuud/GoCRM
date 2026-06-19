import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface CrmContext {
  tenantId: string;
  leadsCount: number;
  dealsCount: number;
  conversionRate: number;
  revenue: number;
  overdueInvoices: number;
  openTasks: number;
  topPerformer?: string;
}

export interface AiInsight {
  type: 'alert' | 'opportunity' | 'suggestion' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  private readonly openai: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateInsights(context: CrmContext): Promise<AiInsight[]> {
    try {
      const prompt = this.buildInsightsPrompt(context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert CRM analyst for NexCRM. Analyze CRM data and return actionable insights in JSON format.
Always respond with a JSON array of insights. Each insight must have: type (alert|opportunity|suggestion|trend), title, description, priority (high|medium|low), and optional action.
Be concise, specific, and data-driven. Respond in Brazilian Portuguese.`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content ?? '{"insights":[]}');
      return result.insights ?? [];
    } catch (error) {
      this.logger.error('Failed to generate AI insights', error.stack);
      return this.getFallbackInsights(context);
    }
  }

  async chat(tenantId: string, message: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Voce e o assistente de IA do NexCRM, um CRM enterprise para equipes de vendas e suporte.
Responda sempre em portugues brasileiro. Seja direto, util e profissional.
Voce pode ajudar com analise de dados, sugestoes de follow-up, resumos de atividades, e estrategias de vendas.`,
          },
          ...history,
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content ?? 'Nao foi possivel processar sua solicitacao.';
    } catch (error) {
      this.logger.error('AI chat failed', error.stack);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
    }
  }

  async generateFollowUpSuggestion(lead: { name: string; email: string; lastContact?: Date; status: string }): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Voce e especialista em vendas B2B. Gere uma sugestao de mensagem de follow-up em portugues brasileiro.',
          },
          {
            role: 'user',
            content: `Lead: ${lead.name}, Status: ${lead.status}, Ultimo contato: ${lead.lastContact?.toLocaleDateString('pt-BR') ?? 'nunca'}. Gere uma mensagem de follow-up profissional e personalizada de 2-3 frases.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      });

      return response.choices[0].message.content ?? '';
    } catch (error) {
      this.logger.error('Follow-up suggestion failed', error.stack);
      return `Ola ${lead.name}, gostaria de dar continuidade a nossa conversa. Podemos marcar uma reuniao rapida esta semana?`;
    }
  }

  private buildInsightsPrompt(ctx: CrmContext): string {
    return `Analise os seguintes dados do CRM e gere 4 insights acionaveis:

- Leads ativos: ${ctx.leadsCount}
- Deals abertos: ${ctx.dealsCount}
- Taxa de conversao: ${ctx.conversionRate}%
- Receita acumulada: R$ ${ctx.revenue.toLocaleString('pt-BR')}
- Faturas em atraso: ${ctx.overdueInvoices}
- Tarefas abertas: ${ctx.openTasks}
${ctx.topPerformer ? `- Melhor vendedor: ${ctx.topPerformer}` : ''}

Retorne um objeto JSON com a chave "insights" contendo um array de insights.`;
  }

  private getFallbackInsights(ctx: CrmContext): AiInsight[] {
    const insights: AiInsight[] = [];

    if (ctx.overdueInvoices > 0) {
      insights.push({
        type: 'alert',
        title: 'Faturas em atraso',
        description: `Existem ${ctx.overdueInvoices} fatura(s) vencidas. Acao imediata necessaria.`,
        priority: 'high',
        action: 'Revisar faturas',
      });
    }

    if (ctx.conversionRate < 15) {
      insights.push({
        type: 'suggestion',
        title: 'Taxa de conversao abaixo da media',
        description: `Sua taxa de ${ctx.conversionRate}% esta abaixo da media do setor (18%). Revise o processo de qualificacao de leads.`,
        priority: 'medium',
        action: 'Analisar pipeline',
      });
    }

    if (ctx.openTasks > 20) {
      insights.push({
        type: 'alert',
        title: 'Backlog de tarefas elevado',
        description: `Voce tem ${ctx.openTasks} tarefas abertas. Priorize as mais urgentes para nao perder oportunidades.`,
        priority: 'medium',
        action: 'Ver tarefas',
      });
    }

    insights.push({
      type: 'opportunity',
      title: 'Potencial de upsell identificado',
      description: 'Analise os clientes com mais de 3 interacoes nos ultimos 30 dias para oportunidades de expansao.',
      priority: 'low',
      action: 'Ver contatos',
    });

    return insights;
  }
}
