import { InterestCategory } from '../../users/entities/interest.entity';

export const interestsSeedData = [

//(emojis para facilidad de selección)
  //hobbies
  { name: 'Lectura', category: InterestCategory.HOBBIES, iconUrl: '📚' },
  { name: 'Jardinería', category: InterestCategory.HOBBIES, iconUrl: '🌱' },
  { name: 'Fotografía', category: InterestCategory.HOBBIES, iconUrl: '📷' },
  { name: 'Pintura', category: InterestCategory.HOBBIES, iconUrl: '🎨' },
  { name: 'Ajedrez', category: InterestCategory.HOBBIES, iconUrl: '♟️' },
  { name: 'Coleccionar', category: InterestCategory.HOBBIES, iconUrl: '🎁' },
  
  //cocina
  { name: 'Cocina tradicional', category: InterestCategory.COOKING, iconUrl: '🍲' },
  { name: 'Repostería', category: InterestCategory.COOKING, iconUrl: '🧁' },
  { name: 'Recetas familiares', category: InterestCategory.COOKING, iconUrl: '👵' },
  { name: 'Panadería', category: InterestCategory.COOKING, iconUrl: '🥖' },
  { name: 'Comida internacional', category: InterestCategory.COOKING, iconUrl: '🌮' },
  
  //manualidades
  { name: 'Tejido', category: InterestCategory.CRAFTS, iconUrl: '🧶' },
  { name: 'Bordado', category: InterestCategory.CRAFTS, iconUrl: '🪡' },
  { name: 'Carpintería', category: InterestCategory.CRAFTS, iconUrl: '🔨' },
  { name: 'Origami', category: InterestCategory.CRAFTS, iconUrl: '🦢' },
  { name: 'Cerámica', category: InterestCategory.CRAFTS, iconUrl: '🏺' },
  { name: 'Bisutería', category: InterestCategory.CRAFTS, iconUrl: '💍' },
  
  //historias
  { name: 'Historia local', category: InterestCategory.STORIES, iconUrl: '🏛️' },
  { name: 'Anécdotas personales', category: InterestCategory.STORIES, iconUrl: '💭' },
  { name: 'Leyendas', category: InterestCategory.STORIES, iconUrl: '📖' },
  { name: 'Historia familiar', category: InterestCategory.STORIES, iconUrl: '👨‍👩‍👧‍👦' },
  { name: 'Eventos históricos', category: InterestCategory.STORIES, iconUrl: '📜' },
  
  //musica
  { name: 'Música clásica', category: InterestCategory.MUSIC, iconUrl: '🎼' },
  { name: 'Música folclórica', category: InterestCategory.MUSIC, iconUrl: '🎵' },
  { name: 'Canto', category: InterestCategory.MUSIC, iconUrl: '🎤' },
  { name: 'Instrumentos musicales', category: InterestCategory.MUSIC, iconUrl: '🎸' },
  { name: 'Baile', category: InterestCategory.MUSIC, iconUrl: '💃' },
  
  //deportes
  { name: 'Caminatas', category: InterestCategory.SPORTS, iconUrl: '🚶' },
  { name: 'Yoga', category: InterestCategory.SPORTS, iconUrl: '🧘' },
  { name: 'Tai Chi', category: InterestCategory.SPORTS, iconUrl: '🥋' },
  { name: 'Natación', category: InterestCategory.SPORTS, iconUrl: '🏊' },
  { name: 'Ejercicios suaves', category: InterestCategory.SPORTS, iconUrl: '🤸' },
  
  //tecnologia
  { name: 'Redes sociales', category: InterestCategory.TECHNOLOGY, iconUrl: '📱' },
  { name: 'Computación básica', category: InterestCategory.TECHNOLOGY, iconUrl: '💻' },
  { name: 'Videojuegos', category: InterestCategory.TECHNOLOGY, iconUrl: '🎮' },
  { name: 'Aplicaciones móviles', category: InterestCategory.TECHNOLOGY, iconUrl: '📲' },
  { name: 'Fotografía digital', category: InterestCategory.TECHNOLOGY, iconUrl: '📸' },
  
  //cultura
  { name: 'Cine clásico', category: InterestCategory.CULTURE, iconUrl: '🎬' },
  { name: 'Teatro', category: InterestCategory.CULTURE, iconUrl: '🎭' },
  { name: 'Poesía', category: InterestCategory.CULTURE, iconUrl: '✍️' },
  { name: 'Tradiciones', category: InterestCategory.CULTURE, iconUrl: '🎉' },
  { name: 'Literatura', category: InterestCategory.CULTURE, iconUrl: '📚' },
  { name: 'Arte', category: InterestCategory.CULTURE, iconUrl: '🖼️' },
  
  // otros
  { name: 'Idiomas', category: InterestCategory.OTHER, iconUrl: '🗣️' },
  { name: 'Viajes', category: InterestCategory.OTHER, iconUrl: '✈️' },
  { name: 'Mascotas', category: InterestCategory.OTHER, iconUrl: '🐕' },
  { name: 'Espiritualidad', category: InterestCategory.OTHER, iconUrl: '🙏' },
  { name: 'Naturaleza', category: InterestCategory.OTHER, iconUrl: '🌳' },
  { name: 'Voluntariado', category: InterestCategory.OTHER, iconUrl: '🤝' },
];