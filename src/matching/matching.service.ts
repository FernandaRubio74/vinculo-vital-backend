import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

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

  constructor(
    private config: ConfigService,
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
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
      age: c.age ?? null,
      interests: c.interests ?? [],
      shortBio: c.shortBio ?? 'N/A',
    }));

    const prompt = `Eres un asistente que evalúa compatibilidad entre personas mayores y jóvenes voluntarios.
Persona objetivo:
- Intereses: ${target.interests?.join(', ') ?? 'N/A'}
- Descripción: ${target.shortBio ?? 'N/A'}
- Edad: ${target.age ?? 'N/A'}

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

  // Ahora requiere userId y usa users reales de la BD
  async getDailySuggestions(userId: string, topK = 5) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('Usuario objetivo no encontrado');

    // todos los usuarios activos (usersService.findAll ya filtra isActive)
    const allUsers = await this.usersService.findAll();
    const candidates = allUsers
      .filter((c) => c.id !== userId)
      .map((c) => ({
        id: c.id,
        name: (c as any).name ?? undefined,
        interests: (c.interests ?? []).map((i: any) => i.name),
        shortBio: (c as any).shortBio ?? undefined,
        age: (c as any).age ?? undefined,
      }));

    const targetProfile: UserProfile = {
      id: user.id,
      name: (user as any).name ?? undefined,
      interests: (user.interests ?? []).map((i: any) => i.name),
      shortBio: (user as any).shortBio ?? undefined,
      age: (user as any).age ?? undefined,
    };

    return this.aiMatch(targetProfile, candidates, topK);
  }

  async sendConnectionRequest(fromId: string, toId: string) {
    // validar que ambos usuarios existan
    const from = await this.usersService.findOne(fromId);
    const to = await this.usersService.findOne(toId);
    if (!from || !to) throw new NotFoundException('Usuario origen o destino no encontrado');

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
