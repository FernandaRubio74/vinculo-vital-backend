import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  interests: string[];
  shortBio?: string;
}

export interface MatchResult {
  id: string;
  score: number;
  explanation: string;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private ai: GoogleGenAI;
  private model = 'gemini-2.0-flash';

  private connectionRequests: { id: string; fromId: string; toId: string; status: string }[] = [];

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY no está definido en .env');
      throw new Error('Falta la variable GEMINI_API_KEY');
    }

    this.ai = new GoogleGenAI({ apiKey, vertexai: false });
  }

  async aiMatch(target: UserProfile, candidates: UserProfile[], topK = 5): Promise<MatchResult[]> {
    if (!candidates || candidates.length === 0) return [];

    const candidatesForPrompt = candidates.map((c) => ({
      id: c.id,
      age: c.age,
      interests: c.interests,
      shortBio: c.shortBio,
    }));

    const prompt = `Eres un asistente que evalúa compatibilidad entre personas mayores y jóvenes voluntarios.
Persona mayor:
- Intereses: ${target.interests.join(', ')}
- Descripción: ${target.shortBio ?? 'N/A'}

Candidatos:
${JSON.stringify(candidatesForPrompt, null, 2)}

Analiza afinidades en intereses, edades y descripciones. 
Devuelve un arreglo JSON con los ${topK} mejores resultados en formato:
[{ "id": string, "score": number (0-100), "explanation": string }]`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || '';
      const match = text.match(/\[.*\]/s);
      const jsonText = match ? match[0] : text;
      const parsed: MatchResult[] = JSON.parse(jsonText);
      return parsed.slice(0, topK);
    } catch (err) {
      this.logger.error('Error al generar coincidencias con Gemini:', err);
      throw new Error('Fallo en el matching con IA');
    }
  }

  async getDailySuggestions() {
    return [
      { id: 'v001', name: 'Carlos', compatibility: 92, reason: 'Intereses similares en jardinería y lectura' },
      { id: 'v002', name: 'María', compatibility: 87, reason: 'Ambos disfrutan actividades al aire libre' },
    ];
  }

  async sendConnectionRequest(fromId: string, toId: string) {
    const newRequest = { id: `req-${Date.now()}`, fromId, toId, status: 'pending' };
    this.connectionRequests.push(newRequest);
    return { message: 'Solicitud enviada correctamente', request: newRequest };
  }

  async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    const request = this.connectionRequests.find((r) => r.id === requestId);
    if (!request) return { message: 'Solicitud no encontrada' };
    request.status = status;
    return { message: `Solicitud ${status}`, request };
  }
}
