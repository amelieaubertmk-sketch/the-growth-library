export interface AIService {
  reflect(input: { notes: string[]; consent: boolean }): Promise<string>;
}
// Future implementation: secure server endpoint, explicit consent, no browser API key.
