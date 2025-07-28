
export interface Master {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  location: string;
  specialties: string[];
  price: string;
  image: string;
  isVideo?: boolean;
  videoUrl?: string;
  likes: number;
  description: string;
}

export const mockMasters: Master[] = [
  {
    id: "1",
    name: "Анна Соколова",
    avatar: "/placeholder.svg",
    rating: 4.9,
    location: "Москва, Арбат",
    specialties: ["Гель-лак", "Маникюр", "Дизайн"],
    price: "от 2500₽",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=600&fit=crop",
    isVideo: true,
    videoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=600&fit=crop",
    likes: 1250,
    description: "Авторский дизайн ногтей ✨ Работаю только с премиум материалами"
  },
  {
    id: "2", 
    name: "Мария Петрова",
    avatar: "/placeholder.svg",
    rating: 4.8,
    location: "СПб, Невский",
    specialties: ["Френч", "Омбре", "Стразы"],
    price: "от 2000₽",
    image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=600&fit=crop",
    likes: 980,
    description: "Классический и современный маникюр 💅 5 лет опыта"
  },
  {
    id: "3",
    name: "Екатерина Смирнова", 
    avatar: "/placeholder.svg",
    rating: 5.0,
    location: "Казань, Центр",
    specialties: ["Nail Art", "3D дизайн", "Роспись"],
    price: "от 3000₽",
    image: "https://images.unsplash.com/photo-1617625802596-705b0c5308da?w=400&h=600&fit=crop",
    isVideo: true,
    videoUrl: "https://images.unsplash.com/photo-1617625802596-705b0c5308da?w=400&h=600&fit=crop",
    likes: 2100,
    description: "Художественная роспись ногтей 🎨 Уникальные дизайны"
  }
];
