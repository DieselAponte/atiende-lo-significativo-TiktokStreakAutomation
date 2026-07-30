src/
│
├── app.ts
├── main.ts
│
├── domain/
│ ├── entities/
│ │ ├── Contact.ts
│ │ ├── Message.ts
│ │ └── Streak.ts
│ ├── enums/
│ │ ├── MessageType.ts
│ │ └── SendStatus.ts
│ └── interfaces/
│ ├── IMessageGenerator.ts
│ └── IMessageProvider.ts
│
├── automation/
│ ├── browser/
│ │ ├── browserManager.ts
│ │ └── playwright.ts
│ │
│ ├── auth/
│ │ ├── login.ts
│ │ └── session.ts
│ │
│ ├── conversations/
│ │ ├── conversationReader.ts
│ │ └── streakDetector.ts
│ │
│ └── messaging/
│ └── messageSender.ts
│
├── engine/
│ ├── generators/
│ │ ├── curiosity.ts
│ │ ├── philosophy.ts
│ │ └── science.ts
│ │
│ ├── providers/
│ │ ├── curiosity.provider.ts
│ │ ├── philosophy.provider.ts
│ │ └── science.provider.ts
│ │
│ ├── templates/
│ │ ├── curiosity.template.ts
│ │ ├── firstMessage.template.ts
│ │ ├── philosophy.template.ts
│ │ └── science.template.ts
│ │
│ └── messageEngine.ts
│
├── database/
│ ├── prisma.ts
│ ├── schema/
│ └── repositories/
│ ├── contact.repository.ts
│ └── message.repository.ts
│
├── scheduler/
│ └── scheduler.ts
│
├── config/
│ ├── env.ts
│ └── logger.ts
│
├── types/
│
└── utils/
