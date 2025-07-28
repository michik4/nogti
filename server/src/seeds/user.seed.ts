import { DataSource } from 'typeorm';
import { UserEntity, Role } from '../entities/user.entity';
import { AdminEntity } from '../entities/admin.entity';
import { NailMasterEntity } from '../entities/nailmaster.entity';
import { ClientEntity } from '../entities/client.entity';
import { ConsoleUtil } from '../utils/console.util';

/**
 * Сид для создания тестовых пользователей
 */
export default class UserSeed {
  /**
   * Запустить сид
   */
  static async run(dataSource: DataSource): Promise<void> {
    ConsoleUtil.showProcess('Создание тестовых пользователей...');

    const userRepository = dataSource.getRepository(UserEntity);
    const adminRepository = dataSource.getRepository(AdminEntity);
    const masterRepository = dataSource.getRepository(NailMasterEntity);
    const clientRepository = dataSource.getRepository(ClientEntity);

    // Проверяем, есть ли уже пользователи в системе
    const existingUsersCount = await userRepository.count();
    if (existingUsersCount > 0) {
      ConsoleUtil.showInfo('Пользователи уже существуют, пропускаем создание');
      return;
    }

    // Создаем тестовых админов
    const testAdmins = [
      {
        email: 'admin@prometai.com',
        username: 'admin',
        password: 'admin123',
        role: Role.ADMIN,
        isGuest: false,
        fullName: 'Главный Администратор',
        phone: '+7-900-000-0001',
        permissions: ['all'],
        isActive: true
      },
      {
        email: 'moderator@prometai.com',
        username: 'moderator',
        password: 'moderator123',
        role: Role.ADMIN,
        isGuest: false,
        fullName: 'Модератор Системы',
        phone: '+7-900-000-0002',
        permissions: ['moderate_masters', 'moderate_designs', 'view_analytics'],
        isActive: true
      }
    ];

    // Создаем тестовых мастеров
    const testMasters = [
      {
        email: 'master1@prometai.com',
        username: 'master_anna',
        password: 'master123',
        role: Role.NAILMASTER,
        isGuest: false,
        fullName: 'Анна Петрова',
        address: 'ул. Красная, 15, Краснодар',
        description: 'Профессиональный nail-мастер с опытом работы 5 лет. Специализируюсь на сложном дизайне и наращивании.',
        phone: '+7-900-111-1111',
        rating: 4.8,
        totalOrders: 156,
        isActive: true,
        latitude: 45.035470,
        longitude: 38.975313,
        isModerated: true,
        reviewsCount: 89,
        specialties: ['Гель-лак', 'Наращивание', 'Дизайн', 'Маникюр'],
        startingPrice: 1500.00
      },
      {
        email: 'master2@prometai.com',
        username: 'master_elena',
        password: 'master123',
        role: Role.NAILMASTER,
        isGuest: false,
        fullName: 'Елена Сидорова',
        address: 'пр. Чекистов, 42, Краснодар',
        description: 'Молодой и креативный мастер, люблю экспериментировать с новыми техниками и трендами.',
        phone: '+7-900-222-2222',
        rating: 4.5,
        totalOrders: 87,
        isActive: true,
        latitude: 45.040315,
        longitude: 38.976952,
        isModerated: false,
        reviewsCount: 45,
        specialties: ['Гель-лак', 'Арт-дизайн', 'Стемпинг'],
        startingPrice: 1200.00
      },
      {
        email: 'master3@prometai.com',
        username: 'master_maria',
        password: 'master123',
        role: Role.NAILMASTER,
        isGuest: false,
        fullName: 'Мария Козлова',
        address: 'ул. Северная, 326, Краснодар',
        description: 'Опытный мастер с медицинским образованием. Работаю с проблемными ногтями.',
        phone: '+7-900-333-3333',
        rating: 4.9,
        totalOrders: 234,
        isActive: true,
        latitude: 45.048267,
        longitude: 38.973108,
        isModerated: true,
        reviewsCount: 187,
        specialties: ['Медицинский педикюр', 'Лечение ногтей', 'Маникюр', 'Гель-лак'],
        startingPrice: 1800.00
      }
    ];

    // Создаем тестовых клиентов
    const testClients = [
      {
        email: 'client1@prometai.com',
        username: 'client_oksana',
        password: 'client123',
        role: Role.CLIENT,
        isGuest: false,
        fullName: 'Оксана Иванова',
        phone: '+7-900-444-4444',
        latitude: 45.043728,
        longitude: 38.981567
      },
      {
        email: 'client2@prometai.com',
        username: 'client_natasha',
        password: 'client123',
        role: Role.CLIENT,
        isGuest: false,
        fullName: 'Наталья Смирнова',
        phone: '+7-900-555-5555',
        latitude: 45.037842,
        longitude: 38.970123
      },
      {
        email: 'demo@prometai.com',
        username: 'demo',
        password: 'demo123',
        role: Role.CLIENT,
        isGuest: true,
        fullName: 'Демо Пользователь',
        phone: '+7-900-666-6666',
        latitude: 45.041256,
        longitude: 38.978945
      }
    ];

    // Создаем админов
    for (const adminData of testAdmins) {
      try {
        const existingUser = await userRepository.findOne({
          where: [
            { email: adminData.email },
            { username: adminData.username }
          ]
        });

        if (existingUser) {
          ConsoleUtil.showInfo(`Администратор ${adminData.username} уже существует, пропускаем`);
          continue;
        }

        const admin = adminRepository.create(adminData);
        await adminRepository.save(admin);
        
        ConsoleUtil.showSuccess(`Создан администратор: ${admin.username} (${admin.email})`);
      } catch (error) {
        console.error(`❌ Ошибка создания администратора ${adminData.username}:`, error);
      }
    }

    // Создаем мастеров
    for (const masterData of testMasters) {
      try {
        const existingUser = await userRepository.findOne({
          where: [
            { email: masterData.email },
            { username: masterData.username }
          ]
        });

        if (existingUser) {
          ConsoleUtil.showInfo(`Мастер ${masterData.username} уже существует, пропускаем`);
          continue;
        }

        const master = masterRepository.create(masterData);
        await masterRepository.save(master);
        
        ConsoleUtil.showSuccess(`Создан мастер: ${master.username} (${master.email})`);
      } catch (error) {
        console.error(`❌ Ошибка создания мастера ${masterData.username}:`, error);
      }
    }

    // Создаем клиентов
    for (const clientData of testClients) {
      try {
        const existingUser = await userRepository.findOne({
          where: [
            { email: clientData.email },
            { username: clientData.username }
          ]
        });

        if (existingUser) {
          ConsoleUtil.showInfo(`Клиент ${clientData.username} уже существует, пропускаем`);
          continue;
        }

        const client = clientRepository.create(clientData);
        await clientRepository.save(client);
        
        ConsoleUtil.showSuccess(`Создан клиент: ${client.username} (${client.email})`);
      } catch (error) {
        console.error(`❌ Ошибка создания клиента ${clientData.username}:`, error);
      }
    }

    ConsoleUtil.showSuccess('Сид пользователей выполнен успешно');
  }
} 