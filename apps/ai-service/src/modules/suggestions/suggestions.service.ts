import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SuggestionRequest {
  tenantId: string;
  userId: string;
  context: 'reply' | 'followup' | 'subject' | 'summary';
  input: string;
}

export interface Suggestion {
  id: string;
  type: string;
  text: string;
  confidence: number;
}

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(private readonly config: ConfigService) {}

  async getSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
    this.logger.log(`Generating ${request.context} suggestions for tenant ${request.tenantId}`);

    switch (request.context) {
      case 'reply':
        return this.getReplysuggestions(request.input);
      case 'followup':
        return this.getFollowUpSuggestions(request.input);
      case 'subject':
        return this.getSubjectSuggestions(request.input);
      case 'summary':
        return this.getSummarySuggestions(request.input);
      default:
        return [];
    }
  }

  private getReplysuggestions(context: string): Suggestion[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'reply',
        text: `Olá! Obrigado pelo contato. Analisando sua solicitação, posso confirmar que nossa equipe está disponível para uma reunião esta semana. Qual horário seria melhor para você?`,
        confidence: 0.92,
      },
      {
        id: crypto.randomUUID(),
        type: 'reply',
        text: `Perfeito, entendi sua necessidade. Vou preparar uma proposta personalizada e envio até amanhã no período da manhã. Posso tirar mais alguma dúvida?`,
        confidence: 0.87,
      },
      {
        id: crypto.randomUUID(),
        type: 'reply',
        text: `Agradeço pelo retorno. Para dar andamento, precisaria de mais alguns detalhes sobre o volume esperado e o prazo de implementação desejado.`,
        confidence: 0.81,
      },
    ];
  }

  private getFollowUpSuggestions(leadName: string): Suggestion[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'followup',
        text: `Olá ${leadName}, gostaria de saber se teve oportunidade de analisar nossa proposta enviada na semana passada. Estou à disposição para esclarecer qualquer dúvida.`,
        confidence: 0.9,
      },
      {
        id: crypto.randomUUID(),
        type: 'followup',
        text: `${leadName}, que tal agendarmos uma call rápida de 15 minutos para apresentar os resultados que nossos clientes similares ao seu perfil obtiveram?`,
        confidence: 0.85,
      },
    ];
  }

  private getSubjectSuggestions(topic: string): Suggestion[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'subject',
        text: `Proposta Comercial NexCRM — ${topic}`,
        confidence: 0.88,
      },
      {
        id: crypto.randomUUID(),
        type: 'subject',
        text: `Próximos passos: Solução para ${topic}`,
        confidence: 0.82,
      },
    ];
  }

  private getSummarySuggestions(conversationText: string): Suggestion[] {
    const wordCount = conversationText.split(' ').length;
    return [
      {
        id: crypto.randomUUID(),
        type: 'summary',
        text: `Conversa de ${wordCount} palavras. Cliente demonstrou interesse em solução enterprise. Principais pontos discutidos: preço, prazo de implementação e integrações. Próximo passo: enviar proposta técnica detalhada.`,
        confidence: 0.91,
      },
    ];
  }
}
