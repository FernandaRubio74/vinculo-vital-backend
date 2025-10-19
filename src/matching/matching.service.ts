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

@Injectable()
export class MatchingService {
    private readonly logger = new Logger(MatchingService.name);
    private ai: GoogleGenAI;
    private model = 'gemini-2.0-flash'; // Modelo rápido y gratuito para estudiantes

    constructor(private config: ConfigService) {
        const apiKey = this.config.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY no está definido en .env');
            throw new Error('Falta la variable GEMINI_API_KEY');
        }

        this.ai = new GoogleGenAI({ apiKey, vertexai: false });
    }

    /**
    * Calcula coincidencias (matching) entre un usuario objetivo y una lista de candidatos.
    * Devuelve una lista de los mejores matches con su puntuación y una breve explicación.
    */
    async aiMatch(target: UserProfile, candidates: UserProfile[], topK = 5) {
        if (!candidates || candidates.length === 0) return [];

        const candidatesForPrompt = candidates.map((c) => ({
            id: c.id,
            age: c.age,
            interests: c.interests,
            shortBio: c.shortBio,
        }));

        const prompt = `Eres un asistente que puntúa qué tan compatible es un voluntario con una persona mayor.

Persona mayor:
- Intereses: ${target.interests.join(', ')}
- Descripción: ${target.shortBio ?? 'N/A'}

Candidatos:
${JSON.stringify(candidatesForPrompt, null, 2)}

Devuelve únicamente un arreglo JSON con objetos: [{id: string, score: number (0-100), explanation: string}].
Incluye solo los ${topK} mejores resultados.`;

    try {
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || response?.text || '';
        const match = text.match(/\[.*\]/s);
        const jsonText = match ? match[0] : text;
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (err) {
        this.logger.error('Error al generar coincidencias con Gemini:', err);
        throw new Error('Fallo en el matching con IA');
    }
}

    /**
    * Ejemplo de integración con tu repositorio de usuarios.
    * Sustituye getUserById() y findVolunteerCandidates() por tus propios métodos.
    */
    async matchForUser(userId: string, repo: any) {
        const target = await repo.getUserById(userId) as UserProfile;
        const candidates = await repo.findVolunteerCandidates({ excludeId: userId, limit: 50 }) as UserProfile[];
        return this.aiMatch(target, candidates, 10);
    }
}