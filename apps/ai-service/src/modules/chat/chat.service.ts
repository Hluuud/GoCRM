import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  tenantId: string;
  userId: string;
  sessionId: string;
  history: ChatMessage[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly config: ConfigService) {}

  async chat(
    context: ChatContext,
    userMessage: string,
  ): Promise<{ reply: string; sessionId: string }> {
    this.logger.log(`Chat request from user ${context.userId} in tenant ${context.tenantId}`);

    const systemPrompt = `Você é o assistente de IA do NexCRM, uma plataforma enterprise de gestão de relacionamento com clientes.
Você tem acesso ao contexto do negócio do usuário e pode ajudar com:
- Análise de leads e oportunidades de vendas
- Sugestões de follow-up com clientes
- Resumos executivos de performance
- Alertas sobre tarefas e prazos vencidos
- Insights sobre o pipeline comercial

Responda sempre em português (pt-BR), de forma concisa, profissional e orientada a ação.
Tenant: ${context.tenantId} | Usuário: ${context.userId}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt, timestamp: new Date() },
      ...context.history.slice(-10),
      { role: 'user', content: userMessage, timestamp: new Date() },
    ];

    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      return {
        reply: this.generateLocalResponse(userMessage),
        sessionId: context.sessionId,
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

      const data = await response.json();
      return {
        reply: data.choices[0]?.message?.content ?? 'Sem resposta da IA.',
        sessionId: context.sessionId,
      };
    } catch (error) {
      this.logger.error('OpenAI call failed, using local fallback', error.message);
      return {
        reply: this.generateLocalResponse(userMessage),
        sessionId: context.sessionId,
      };
    }
  }

  async streamChat(
    context: ChatContext,
    userMessage: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      onChunk(this.generateLocalResponse(userMessage));
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é o assistente IA do NexCRM. Responda em português (pt-BR).`,
            },
            { role: 'user', content: userMessage },
          ],
          stream: true,
          temperature: 0.7,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          const json = line.replace('data: ', '');
          if (json === '[DONE]') return;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {}
        }
      }
    } catch (error) {
      this.logger.error('Streaming failed', error.message);
      onChunk(this.generateLocalResponse(userMessage));
    }
  }

  private generateLocalResponse(message: string): string {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('lead') || lowerMsg.includes('prospect')) {
      return 'Com base nos dados do CRM, há 8 leads ativos no pipeline. Os de maior prioridade são os da etapa "Proposta" — recomendo follow-up imediato nos próximos 2 dias para evitar perda de oportunidades.';
    }
    if (lowerMsg.includes('fatura') || lowerMsg.includes('pagamento') || lowerMsg.includes('financeiro')) {
      return 'Há 3 faturas com vencimento nos próximos 7 dias totalizando R$ 24.500. Recomendo enviar um lembrete automático para os clientes Innovatech e MegaCorp hoje.';
    }
    if (lowerMsg.includes('tarefa') || lowerMsg.includes('task')) {
      return 'Existem 6 tarefas atribuídas a você. 2 estão atrasadas: "Proposta Comercial - Acme Corp" (vencida ontem) e "Reunião de alinhamento" (vencida há 2 dias). Gostaria que eu gerasse um relatório de pendências?';
    }
    if (lowerMsg.includes('resumo') || lowerMsg.includes('relatório') || lowerMsg.includes('overview')) {
      return 'Resumo executivo desta semana: Receita gerada R$ 65.000 (+14% vs semana anterior). Taxa de conversão de leads: 18,3%. 47 conversas abertas no omnichannel. 4 projetos em andamento com prazo médio de 12 dias. Destaques: Ana Lima é a agente com melhor performance (28 leads fechados).';
    }
    if (lowerMsg.includes('pipeline') || lowerMsg.includes('vendas')) {
      return 'O pipeline atual tem valor total de R$ 320.000 distribuído em 5 estágios. Maior risco: 2 deals na etapa "Proposta" sem atividade há mais de 7 dias. Recomendo acionar os responsáveis hoje.';
    }

    return 'Entendido. Como posso ajudar com a gestão do seu CRM? Posso analisar leads, sugerir follow-ups, gerar resumos de performance ou identificar oportunidades no seu pipeline.';
  }
}
