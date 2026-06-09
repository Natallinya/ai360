export type AnimalFusionStyle = 'cute' | 'realistic' | 'cartoon';

export interface AnimalFusionRequest {
  animal1: string;
  animal2: string;
  style?: AnimalFusionStyle;
}

export interface AnimalFusionResponse {
  animal1: string;
  animal2: string;
  title: string;
  prompt: string;
  imageUrl: string;
  provider: 'stablehorde' | 'openai' | 'placeholder';
}
