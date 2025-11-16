import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Sample passages
  const passages = [
    {
      id: 'passage_1',
      title: 'The Future of Renewable Energy',
      content: `Climate change has become one of the most pressing challenges of our time, and renewable energy sources are at the forefront of solutions. Solar and wind power have seen dramatic cost reductions over the past decade, making them competitive with traditional fossil fuels. In 2023, renewable energy capacity grew by 50% globally, with solar power leading the charge.

However, the transition to renewable energy isn't without challenges. Energy storage remains a critical issue, as solar and wind power are intermittent by nature. Battery technology has improved significantly, but we still need innovations in long-term energy storage to ensure grid stability.

Despite these challenges, many experts believe that renewable energy will dominate the global energy mix by 2050. Countries like Denmark and Uruguay already generate over 40% of their electricity from renewable sources, proving that a sustainable energy future is achievable.`,
      timeLimit: 15,
      questions: [
        {
          id: 'q1_p1',
          questionText: 'What are the main challenges facing renewable energy adoption?',
          recommendedAnswer: 'The main challenges include energy storage due to the intermittent nature of solar and wind power, and the need for innovations in long-term storage to ensure grid stability.',
          order: 1,
        },
        {
          id: 'q2_p1',
          questionText: 'Can you give examples of countries successfully using renewable energy?',
          recommendedAnswer: 'Denmark and Uruguay are mentioned as examples, both generating over 40% of their electricity from renewable sources.',
          order: 2,
        },
        {
          id: 'q3_p1',
          questionText: 'What makes you optimistic or pessimistic about renewable energy\'s future?',
          recommendedAnswer: 'Open-ended question allowing personal opinion based on the passage information.',
          order: 3,
        },
      ],
    },
    {
      id: 'passage_2',
      title: 'The Benefits of Multilingualism',
      content: `Learning multiple languages offers numerous cognitive and social benefits. Research has shown that bilingual individuals often demonstrate enhanced problem-solving skills, improved memory, and greater mental flexibility compared to monolinguals. These cognitive advantages aren't limited to language tasks – they extend to various aspects of thinking and learning.

From a social perspective, multilingualism opens doors to different cultures and perspectives. When you speak someone's native language, you gain deeper insights into their worldview and values. This cultural competence is increasingly valuable in our globalized world, both personally and professionally.

Moreover, studies suggest that multilingualism may delay the onset of dementia and other age-related cognitive decline. The constant mental exercise of switching between languages appears to build cognitive reserve, providing a buffer against cognitive aging. Despite the challenges of language learning, the lifelong benefits make it a worthwhile investment.`,
      timeLimit: 12,
      questions: [
        {
          id: 'q1_p2',
          questionText: 'What cognitive benefits does multilingualism provide?',
          recommendedAnswer: 'Enhanced problem-solving skills, improved memory, greater mental flexibility, and potentially delayed onset of dementia and cognitive decline.',
          order: 1,
        },
        {
          id: 'q2_p2',
          questionText: 'How does knowing multiple languages help in understanding different cultures?',
          recommendedAnswer: 'It provides deeper insights into others\' worldviews and values, enhancing cultural competence which is valuable in a globalized world.',
          order: 2,
        },
        {
          id: 'q3_p2',
          questionText: 'Do you speak multiple languages? What has your experience been?',
          recommendedAnswer: 'Open-ended personal question to engage the student.',
          order: 3,
        },
      ],
    },
    {
      id: 'passage_3',
      title: 'The Impact of Social Media on Society',
      content: `Social media has fundamentally transformed how we communicate, share information, and connect with others. Platforms like Facebook, Twitter, and Instagram have created unprecedented opportunities for global connectivity, allowing people to maintain relationships across vast distances and find communities of shared interests.

However, concerns about social media's impact on mental health have grown significantly. Studies have linked excessive social media use to increased anxiety, depression, and feelings of inadequacy, particularly among teenagers and young adults. The constant comparison with others' curated online personas can negatively affect self-esteem and life satisfaction.

Additionally, the spread of misinformation on social media platforms has become a critical challenge. False information can spread faster than fact-checked news, influencing public opinion and even election outcomes. While social media companies have taken steps to combat misinformation, the balance between content moderation and free speech remains contentious.`,
      timeLimit: 15,
      questions: [
        {
          id: 'q1_p3',
          questionText: 'What are the positive aspects of social media mentioned in the passage?',
          recommendedAnswer: 'Global connectivity, maintaining long-distance relationships, and finding communities of shared interests.',
          order: 1,
        },
        {
          id: 'q2_p3',
          questionText: 'What concerns about social media does the passage highlight?',
          recommendedAnswer: 'Negative impacts on mental health, increased anxiety and depression, self-esteem issues, and the spread of misinformation.',
          order: 2,
        },
        {
          id: 'q3_p3',
          questionText: 'How do you think we should balance content moderation and free speech?',
          recommendedAnswer: 'Open-ended question encouraging critical thinking about the dilemma presented.',
          order: 3,
        },
      ],
    },
  ];

  // Create passages with questions
  for (const passageData of passages) {
    const { questions, ...passageInfo } = passageData;

    await prisma.passages.upsert({
      where: { id: passageData.id },
      update: {},
      create: {
        ...passageInfo,
        updatedAt: new Date(),
        questions: {
          create: questions.map((q) => ({
            ...q,
            updatedAt: new Date(),
          })),
        },
      },
    });

    console.log(`✓ Created passage: ${passageData.title}`);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

